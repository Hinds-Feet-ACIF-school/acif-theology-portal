import * as MaterialModel from "../models/material.model.js";
import * as WeekModel from "../models/week.model.js"; // To validate weekId
import { getStorage } from "firebase-admin/storage";
import { storage } from '../config/firebase.config.js';
import { v4 as uuidv4 } from 'uuid';

const bucket = getStorage().bucket();

const uploadFileToStorage = async (file, weekId, materialId) => {
    if (!file) return null;
    const bucket = storage.bucket(); 

    const fileExtension = file.originalname.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    // Ensure weekId and materialId are valid for path construction
    const safeWeekId = weekId || 'unknown-week'; // Fallback, though weekId should be validated before this
    const safeMaterialId = materialId || uuidv4(); // Use uuidv4 if materialId is for a new material

    const filePath = `materials/${safeWeekId}/${safeMaterialId}/${uniqueFilename}`;
    const fileUpload = bucket.file(filePath);

    const blobStream = fileUpload.createWriteStream({
        metadata: {
            contentType: file.mimetype
        },
        // public: true, // Alternative to makePublic() later, but makePublic() is more explicit
    });

    return new Promise((resolve, reject) => {
        blobStream.on('error', (error) => {
            console.error("Firebase Storage upload stream error:", error);
            reject(new Error(`Failed to upload file: ${error.message}`));
        });

        blobStream.on('finish', async () => {
            try {
                 // Option 1: Make file public and get public URL (simpler for direct access)
                 await fileUpload.makePublic();
                 const downloadURL = fileUpload.publicUrl();
                 console.log(`File ${filePath} uploaded and made public. URL: ${downloadURL}`);

                // Option 2: Use Signed URLs (more secure, URLs expire)
                // const [signedUrl] = await fileUpload.getSignedUrl({
                //     action: 'read',
                //     expires: '03-09-2491' // Example: Very long expiry. Use a shorter, appropriate duration.
                // });
                // const downloadURL = signedUrl;
                // console.log(`File ${filePath} uploaded. Signed URL generated.`);

                resolve({ downloadURL, filePath });
            } catch (urlError) {
                 console.error("Error making file public or getting download/signed URL:", urlError);
                 reject(new Error(`Upload succeeded but failed to get URL: ${urlError.message}`));
            }
        });
        blobStream.end(file.buffer);
    });
};

const deleteFileFromStorage = async (filePath) => {
    if (!filePath) {
        console.warn("deleteFileFromStorage called with no filePath.");
        return;
    }
    try {
        const fileRef = bucket.file(filePath);
        await fileRef.delete();
        console.log(`File deleted from storage: ${filePath}`);
    } catch (error) {
        if (error.code === 404) { // File not found is not an error for deletion attempt
             console.log(`File not found during deletion (maybe already deleted or path incorrect): ${filePath}`);
        } else {
            console.error(`Error deleting file ${filePath} from storage: Code ${error.code}, Message: ${error.message}`);
            // Optionally re-throw if you want the calling function to handle it
            // throw error;
        }
    }
};

export const createMaterial = async (req, res) => {
    let uploadedFileInfo = null;
    try {
        const materialData = req.body; // Contains weekId, title, type, description, contentUrl (if external) etc.
        const file = req.file;          // The uploaded file from multer
        const { uid } = req.user;       // Assuming req.user is populated by auth middleware

        // --- Basic Validation ---
        if (!materialData.weekId || !materialData.title || !materialData.type) {
            return res.status(400).json({ message: "weekId, title, and type are required for material." });
        }
        console.log(`Attempting to create material. Received weekId: ${materialData.weekId}, title: ${materialData.title}, type: ${materialData.type}`);

        // --- Validate weekId ---
        const week = await WeekModel.getWeekById(materialData.weekId);
        if (!week) {
            console.error(`Material creation error: Week with ID '${materialData.weekId}' not found.`);
            return res.status(404).json({ message: `Week with ID ${materialData.weekId} not found.` });
        }
        console.log(`Week ${materialData.weekId} validated successfully for material creation.`);

        // --- File Upload Logic ---
        // Define which material/asset types from frontend require a file upload here
        // These types are typically sent from the frontend's createMaterial call within handleSaveClick
        const typesPotentiallyUploadingFile = ['reading', 'document_asset', 'video_asset', 'image_asset'];
        let finalContentUrl = materialData.contentUrl || null;
        let finalStoragePath = materialData.storagePath || null;

        if (file && typesPotentiallyUploadingFile.includes(materialData.type)) {
            console.log(`File '${file.originalname}' found for material type '${materialData.type}'. Uploading...`);
            // For new material, materialId for path generation can be null or a new UUID
            uploadedFileInfo = await uploadFileToStorage(file, materialData.weekId, null); 
            if (!uploadedFileInfo || !uploadedFileInfo.downloadURL) { // Check for downloadURL specifically
                throw new Error("File upload process failed or did not return a valid URL.");
            }
            console.log(`File uploaded successfully. Path: ${uploadedFileInfo.filePath}, URL: ${uploadedFileInfo.downloadURL}`);
            finalContentUrl = uploadedFileInfo.downloadURL;
            finalStoragePath = uploadedFileInfo.filePath;
        } else if (typesPotentiallyUploadingFile.includes(materialData.type) && !finalContentUrl) {
            // If it's a type that typically involves a file, but no file was uploaded and no contentUrl was provided.
            // 'reading' and 'document_asset' generally require a file.
            // 'video_asset' and 'image_asset' might accept an external URL as contentUrl.
            if (materialData.type === 'reading' || materialData.type === 'document_asset') {
                return res.status(400).json({ message: `A file is required for material type '${materialData.type}'.` });
            }
            // For other asset types, if no file and no contentUrl, it might be an issue depending on strictness.
        } else if (materialData.type === 'resource' && !finalContentUrl) { 
            // 'resource' type (like an external link) must have a contentUrl.
            return res.status(400).json({ message: `A contentUrl is required for material type '${materialData.type}'.` });
        }

        // --- Prepare Data for Database ---
        const dataToSave = {
            weekId: materialData.weekId,
            title: materialData.title,
            type: materialData.type, // This is the Material type like 'reading', 'video', 'resource', 'document_asset' etc.
            description: materialData.description || null,
            contentUrl: finalContentUrl,
            storagePath: finalStoragePath,
            details: materialData.details || null, // For any extra JSON details
            order: materialData.order !== undefined ? parseInt(materialData.order, 10) : 0, // Ensure order is a number
            createdBy: uid,
            // isRequired: typeof materialData.isRequired === 'boolean' ? materialData.isRequired : false, // If materials can be required
        };

        const newMaterial = await MaterialModel.createMaterial(dataToSave);
        console.log("Material record created successfully in DB:", newMaterial.id);

        res.status(201).json({ 
            message: "Material created successfully", 
            material: newMaterial // Send the full material object back
        });

    } catch (error) {
        console.error("Error in createMaterial controller:", error.message, error.stack);
        if (uploadedFileInfo && uploadedFileInfo.filePath) {
            console.warn(`Error occurred after file upload for material. Attempting to delete uploaded file: ${uploadedFileInfo.filePath}`);
            await deleteFileFromStorage(uploadedFileInfo.filePath);
        }
        res.status(500).json({ message: `Failed to create material: ${error.message}` });
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