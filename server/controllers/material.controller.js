import * as MaterialModel from "../models/material.model.js";
import * as WeekModel from "../models/week.model.js";
import { getStorage } from "firebase-admin/storage";
import { storage } from '../config/firebase.config.js';
import { v4 as uuidv4 } from 'uuid';
import CloudConvert from 'cloudconvert';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PDFDocument } from 'pdf-lib';

// --- Environment Variable Check on Server Start ---
console.log('--- ENVIRONMENT VARIABLE CHECK ---');
console.log('Live API Key Loaded:   ', !!process.env.CLOUDCONVERT_API_KEY);
console.log('Sandbox API Key Loaded:', !!process.env.CLOUDCONVERT_SANDBOX_API_KEY);
if (!process.env.CLOUDCONVERT_API_KEY || !process.env.CLOUDCONVERT_SANDBOX_API_KEY) {
    console.error("FATAL ERROR: One or more CloudConvert API keys are missing from environment variables.");
    // In a real app, you might want to exit here: process.exit(1);
}
console.log('---------------------------------');

const bucket = getStorage().bucket();

// --- Create TWO separate, correctly configured instances ---
const liveCloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);
const sandboxCloudConvert = new CloudConvert(process.env.CLOUDCONVERT_SANDBOX_API_KEY, true); // The 'true' is critical for sandbox mode

const uploadFileToStorage = async (file, weekId, materialId) => {
    // ... (This function is perfect, no changes needed)
    if (!file) return null;
    const bucket = storage.bucket(); 
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const safeWeekId = weekId || 'unknown-week';
    const safeMaterialId = materialId || uuidv4();
    const filePath = `materials/${safeWeekId}/${safeMaterialId}/${uniqueFilename}`;
    const fileUpload = bucket.file(filePath);
    const blobStream = fileUpload.createWriteStream({ metadata: { contentType: file.mimetype } });
    return new Promise((resolve, reject) => {
        blobStream.on('error', (error) => reject(new Error(`Failed to upload file: ${error.message}`)));
        blobStream.on('finish', async () => {
            try {
                 await fileUpload.makePublic();
                 const downloadURL = fileUpload.publicUrl();
                 console.log(`File ${filePath} uploaded and made public. URL: ${downloadURL}`);
                 resolve({ downloadURL, filePath });
            } catch (urlError) {
                 reject(new Error(`Upload succeeded but failed to get URL: ${urlError.message}`));
            }
        });
        blobStream.end(file.buffer);
    });
};

const deleteFileFromStorage = async (filePath) => {
    // ... (This function is perfect, no changes needed)
    if (!filePath) return;
    try {
        await bucket.file(filePath).delete();
        console.log(`File deleted from storage: ${filePath}`);
    } catch (error) {
        if (error.code !== 404) console.error(`Error deleting file ${filePath} from storage:`, error);
    }
};

const getPdfPageCount = async (pdfPath) => {
    // ... (This function is perfect, no changes needed)
    try {
        const pdfBytes = await fs.promises.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        return pdfDoc.getPageCount();
    } catch (error) {
        console.error('Error getting PDF page count:', error);
        return null;
    }
};

export const createMaterial = async (req, res) => {
    let uploadedFileInfo = null;
    let tempFilePath = null;
    let pdfFilePath = null;
    
    try {
        const materialData = req.body;
        const file = req.file;
        const { uid } = req.user;

        if (!materialData.weekId || !materialData.title || !materialData.type) {
            return res.status(400).json({ message: "weekId, title, and type are required for material." });
        }
        console.log(`Attempting to create material. Received weekId: ${materialData.weekId}, title: ${materialData.title}, type: ${materialData.type}`);

        const week = await WeekModel.getWeekById(materialData.weekId);
        if (!week) return res.status(404).json({ message: `Week with ID ${materialData.weekId} not found.` });

        let finalContentUrl = materialData.contentUrl || null;
        let finalStoragePath = materialData.storagePath || null;

        if (file) {
            console.log(`File '${file.originalname}' found. Uploading...`);
            tempFilePath = path.join(os.tmpdir(), file.originalname);
            await fs.promises.writeFile(tempFilePath, file.buffer);
            
            uploadedFileInfo = await uploadFileToStorage(file, materialData.weekId, null);
            if (!uploadedFileInfo) throw new Error("File upload to storage failed.");
            
            if (materialData.type === 'document_asset') {
                const pdfFileName = `${path.parse(file.originalname).name}.pdf`;
                pdfFilePath = path.join(os.tmpdir(), pdfFileName);
                
                try {
                    // --- Using the LIVE API ---
                    console.log('🚀 Starting LIVE file conversion job...');

                    const job = await liveCloudConvert.jobs.create({
                        tasks: {
                            'import-1': { operation: 'import/upload' },
                            'convert-1': {
                                operation: 'convert', input: 'import-1', output_format: 'pdf',
                                engine: 'office', engine_version: '2016'
                            },
                            'export-1': { operation: 'export/url', input: 'convert-1', inline: false }
                        },
                        tag: 'live-conversion'
                    });
                    
                    const importTask = job.tasks.find(task => task.name === 'import-1');
                    if (!importTask) throw new Error('Could not find import task in job.');

                    console.log(`✅ LIVE Job ${job.id} created. Uploading file to import task...`);
                    await liveCloudConvert.tasks.upload(importTask, fs.createReadStream(tempFilePath), file.originalname);
                    
                    console.log(`⏳ Waiting for LIVE job ${job.id} to finish...`);
                    const finishedJob = await liveCloudConvert.jobs.wait(job.id);
                    console.log(`✅ LIVE Job finished!`);

                    const exportTask = finishedJob.tasks.find(task => task.name === 'export-1' && task.status === 'finished');
                    if (!exportTask?.result?.files?.length) {
                        console.error('Full finished job details:', JSON.stringify(finishedJob, null, 2));
                        throw new Error('Export task failed or did not produce a file.');
                    }

                    const convertedFile = exportTask.result.files[0];
                    console.log(`🎉 Success! Converting file: ${convertedFile.filename}`);

                    const writeStream = fs.createWriteStream(pdfFilePath);
                    const downloader = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);
                    await downloader.files.download(convertedFile.url, writeStream);
                    console.log(`✅ File downloaded to ${pdfFilePath}`);

                    const numPages = await getPdfPageCount(pdfFilePath);
                    if (!numPages) throw new Error('Failed to get PDF page count');

                    const pdfFile = await fs.promises.readFile(pdfFilePath);
                    const pdfUploadInfo = await uploadFileToStorage(
                        { buffer: pdfFile, originalname: pdfFileName, mimetype: 'application/pdf' },
                        materialData.weekId, null
                    );
                    if (!pdfUploadInfo) throw new Error('Failed to upload converted PDF to storage');

                    materialData.viewablePdfUrl = pdfUploadInfo.downloadURL;
                    materialData.numPages = numPages;

                } catch (conversionError) {
                    console.error('❌ Error in document conversion:', conversionError);
                    throw new Error(`Document processing and conversion failed: ${conversionError.message}`);
                }
            }
            
            finalContentUrl = uploadedFileInfo.downloadURL;
            finalStoragePath = uploadedFileInfo.filePath;
        } 
        
        const dataToSave = {
            weekId: materialData.weekId, title: materialData.title, type: materialData.type,
            description: materialData.description || null, contentUrl: finalContentUrl,
            storagePath: finalStoragePath, details: materialData.details || null,
            order: materialData.order !== undefined ? parseInt(materialData.order, 10) : 0,
            createdBy: uid, viewablePdfUrl: materialData.viewablePdfUrl || null,
            numPages: materialData.numPages || null
        };

        const newMaterial = await MaterialModel.createMaterial(dataToSave);
        console.log("Material record created successfully in DB:", newMaterial.id);
        res.status(201).json({ message: "Material created successfully", material: newMaterial });

    } catch (error) {
        console.error("Error in createMaterial controller:", error.message, error.stack);
        if (uploadedFileInfo) await deleteFileFromStorage(uploadedFileInfo.filePath);
        res.status(500).json({ message: `Failed to create material: ${error.message}` });
    } finally {
        if (tempFilePath) try { await fs.promises.unlink(tempFilePath); } catch (e) { if (e.code !== 'ENOENT') console.error(e); }
        if (pdfFilePath) try { await fs.promises.unlink(pdfFilePath); } catch (e) { if (e.code !== 'ENOENT') console.error(e); }
    }
};

export const getMaterialsByWeek = async (req, res) => {
    try {
        const { weekId } = req.params;
        if (!weekId) {
             return res.status(400).json({ message: "weekId parameter is required." });
        }
        const materials = await MaterialModel.getMaterialsByWeekId(weekId);
        res.status(200).json(materials);
    } catch (error) {
        console.error(`Error getting materials for week ${req.params.weekId}:`, error.message);
        res.status(500).json({ message: `Failed to get materials: ${error.message}` });
    }
};

export const getMaterialById = async (req, res) => {
      try {
        const { materialId } = req.params;
        const material = await MaterialModel.getMaterialById(materialId);
        if (!material) {
            return res.status(404).json({ message: "Material not found" });
        }
        res.status(200).json(material);
    } catch (error) {
        console.error(`Error getting material ${req.params.materialId}:`, error.message);
        res.status(500).json({ message: `Failed to get material: ${error.message}` });
    }
};

export const updateMaterial = async (req, res) => {
    let uploadedFileInfo = null;
    let oldStoragePathToDelete = null;

    try {
        const { materialId } = req.params;
        const materialData = req.body; // Contains new title, type, description, contentUrl (if external), etc.
        const file = req.file;          // The new uploaded file, if any
        const { uid } = req.user;

        const existingMaterial = await MaterialModel.getMaterialById(materialId);
        if (!existingMaterial) {
             return res.status(404).json({ message: "Material not found" });
        }

        // Start with existing data and selectively update
        const dataToUpdate = {
            title: materialData.title !== undefined ? materialData.title : existingMaterial.title,
            description: materialData.description !== undefined ? materialData.description : existingMaterial.description,
            type: materialData.type !== undefined ? materialData.type : existingMaterial.type,
            contentUrl: existingMaterial.contentUrl, // Default to existing, will be overwritten if needed
            storagePath: existingMaterial.storagePath, // Default to existing
            details: materialData.details !== undefined ? materialData.details : existingMaterial.details,
            order: materialData.order !== undefined ? parseInt(materialData.order, 10) : existingMaterial.order,
            updatedBy: uid, // Or use a server timestamp for updatedAt
        };

        const typesPotentiallyUploadingFile = ['reading', 'document_asset', 'video_asset', 'image_asset'];
        const newTypeRequiresFile = typesPotentiallyUploadingFile.includes(dataToUpdate.type);
        const oldTypeRequiredFile = typesPotentiallyUploadingFile.includes(existingMaterial.type);

        if (file && newTypeRequiresFile) {
            console.log(`New file '${file.originalname}' uploaded for material update (ID: ${materialId}). Processing...`);
            uploadedFileInfo = await uploadFileToStorage(file, existingMaterial.weekId, materialId); // Use existing weekId
            if (!uploadedFileInfo || !uploadedFileInfo.downloadURL) {
                throw new Error("New file upload failed during material update.");
            }
            dataToUpdate.contentUrl = uploadedFileInfo.downloadURL;
            dataToUpdate.storagePath = uploadedFileInfo.filePath;

            if (existingMaterial.storagePath && existingMaterial.storagePath !== uploadedFileInfo.filePath) {
                oldStoragePathToDelete = existingMaterial.storagePath;
            }
        } else if (materialData.type && materialData.type !== existingMaterial.type) { // Type changed
            if (newTypeRequiresFile) {
                // Type changed to one that requires a file, but no new file was uploaded.
                // This might mean an external URL is provided via materialData.contentUrl.
                if (materialData.contentUrl !== undefined) {
                    dataToUpdate.contentUrl = materialData.contentUrl;
                    if (existingMaterial.storagePath) oldStoragePathToDelete = existingMaterial.storagePath; // Delete old file if it existed
                    dataToUpdate.storagePath = null; // Switched to URL-based
                } else {
                    // If type changes to a file-based one without a new file or URL, it's problematic
                    // Keep existing contentUrl/storagePath or clear them? For now, let's assume if type changes to file-based without a file, it's an issue or means to clear.
                    // This logic might need refinement based on desired behavior.
                     console.warn(`Material type changed to ${dataToUpdate.type} but no new file or contentUrl provided. Retaining old contentUrl/storagePath if compatible, otherwise clearing.`);
                     if(!typesPotentiallyUploadingFile.includes(existingMaterial.type) && existingMaterial.contentUrl){
                        // if old type was not file based but had a URL, and new type is file based but no file, clear URL.
                        // dataToUpdate.contentUrl = null; 
                     }
                }
            } else { // New type does not require a file
                if (materialData.contentUrl !== undefined) {
                    dataToUpdate.contentUrl = materialData.contentUrl;
                } else if (dataToUpdate.type === 'resource') { // Example: if resource type means simple link
                    // If contentUrl is not provided for a resource type, it should be an error or cleared.
                    // For now, assume if not provided in materialData, it's cleared.
                    dataToUpdate.contentUrl = null;
                }
                if (existingMaterial.storagePath) { // If old type had a file, delete it
                    oldStoragePathToDelete = existingMaterial.storagePath;
                }
                dataToUpdate.storagePath = null;
            }
        } else if (materialData.contentUrl !== undefined && materialData.contentUrl !== existingMaterial.contentUrl) {
            // contentUrl changed directly (e.g. for a video link or resource link)
            dataToUpdate.contentUrl = materialData.contentUrl;
            if (oldTypeRequiredFile && existingMaterial.storagePath) { // If it was previously a file, delete it
                oldStoragePathToDelete = existingMaterial.storagePath;
                dataToUpdate.storagePath = null;
            }
        }


        const updatedMaterial = await MaterialModel.updateMaterial(materialId, dataToUpdate);

        if (oldStoragePathToDelete) {
            console.log(`Material DB record updated. Deleting old file from storage: ${oldStoragePathToDelete}`);
            await deleteFileFromStorage(oldStoragePathToDelete);
        }

        res.status(200).json({ message: "Material updated successfully", material: updatedMaterial });

    } catch (error) {
        console.error(`Error updating material ${req.params.materialId}:`, error.message, error.stack);
        // Rollback new file upload if DB update fails
        if (uploadedFileInfo && uploadedFileInfo.filePath) {
            console.warn(`DB error after new file upload during update. Attempting to delete newly uploaded file: ${uploadedFileInfo.filePath}`);
            await deleteFileFromStorage(uploadedFileInfo.filePath);
        }
        res.status(500).json({ message: `Failed to update material: ${error.message}` });
    }
};

export const deleteMaterial = async (req, res) => {
    try {
        const { materialId } = req.params;

        const material = await MaterialModel.getMaterialById(materialId);
        if (!material) {
            return res.status(404).json({ message: "Material not found." });
        }

        // Delete from DB first
        await MaterialModel.deleteMaterial(materialId);
        console.log(`Material record ${materialId} deleted from DB.`);

        // Then delete from storage if a path exists
        if (material.storagePath) {
             console.log(`Attempting to delete file from storage: ${material.storagePath}`);
             await deleteFileFromStorage(material.storagePath);
        }

        res.status(200).json({ message: "Material deleted successfully." });
    } catch (error) {
        console.error(`Error deleting material ${req.params.materialId}:`, error.message, error.stack);
        // Note: If DB delete succeeds but storage delete fails, the record is gone but file might be orphaned.
        // Consider more robust two-phase commit or cleanup jobs for orphaned files in a production system.
        res.status(500).json({ message: `Failed to delete material: ${error.message}` });
    }
};