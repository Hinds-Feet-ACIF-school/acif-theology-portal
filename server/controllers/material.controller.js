import * as MaterialModel from "../models/material.model.js";
import * as WeekModel from "../models/week.model.js";



import { getStorage } from "firebase-admin/storage";


import { v4 as uuidv4 } from 'uuid';


const bucket = getStorage().bucket();

const uploadFileToStorage = async (file, weekId, materialId) => {
    if (!file) return null;

    const fileExtension = file.originalname.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const filePath = `materials/${weekId}/${materialId || uuidv4()}/${uniqueFilename}`;
    const fileUpload = bucket.file(filePath);

    const blobStream = fileUpload.createWriteStream({
        metadata: {
            contentType: file.mimetype
        },
    });

    return new Promise((resolve, reject) => {
        blobStream.on('error', (error) => {
            console.error("Firebase Storage upload stream error:", error);
            reject(new Error(`Failed to upload file: ${error.message}`));
        });

        blobStream.on('finish', async () => {
            try {




                 const [signedUrl] = await fileUpload.getSignedUrl({
                     action: 'read',
                     expires: '03-09-2491'
                 });
                 const downloadURL = signedUrl;



                console.log('File upload finished. Accessible via URL.');
                resolve({ downloadURL, filePath });
            } catch (urlError) {
                 console.error("Error getting download/signed URL:", urlError);
                 reject(new Error(`Upload succeeded but failed to get URL: ${urlError.message}`));
            }
        });
        blobStream.end(file.buffer);
    });
};


const deleteFileFromStorage = async (filePath) => {
    if (!filePath) return;
    try {

        const fileRef = bucket.file(filePath);
        await fileRef.delete();
        console.log(`File deleted from storage: ${filePath}`);
    } catch (error) {
        if (error.code !== 404) {
            console.error(`Error deleting file ${filePath} from storage: Code ${error.code}, Message: ${error.message}`);
        } else {
             console.log(`File not found during deletion (maybe already deleted?): ${filePath}`);
        }
    }
};




export const createMaterial = async (req, res) => {

     let uploadedFileInfo = null;
    try {
        const materialData = req.body;
        const file = req.file;
        const { uid } = req.user;

        if (!materialData.weekId || !materialData.title || !materialData.type) {
            return res.status(400).json({ message: "weekId, title, and type are required." });
        }
        if (materialData.type === 'reading' && !file) {
            return res.status(400).json({ message: "A PDF file is required for 'Reading' type." });
        }

        const week = await WeekModel.getWeekById(materialData.weekId);
        if (!week) {
            return res.status(404).json({ message: `Week with ID ${materialData.weekId} not found.` });
        }

        if (materialData.type === 'reading' && file) {
            console.log(`Uploading file for new material: ${file.originalname}`);
            uploadedFileInfo = await uploadFileToStorage(file, materialData.weekId, null);
            if (!uploadedFileInfo) {
                throw new Error("File upload process failed.");
            }
            console.log(`File uploaded successfully: ${uploadedFileInfo.filePath}`);
        }

        const dataToSave = {
            ...materialData,
            contentUrl: materialData.type === 'reading' ? uploadedFileInfo?.downloadURL : materialData.contentUrl,
            storagePath: materialData.type === 'reading' ? uploadedFileInfo?.filePath : null,
            createdBy: uid,
        };

        const newMaterial = await MaterialModel.createMaterial(dataToSave);
        res.status(201).json({ message: "Material created successfully", material: newMaterial });

    } catch (error) {
        console.error("Error creating material:", error);
        if (uploadedFileInfo && uploadedFileInfo.filePath) {
            console.warn(`DB error after file upload. Attempting to delete uploaded file: ${uploadedFileInfo.filePath}`);
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
        console.error(`Error getting materials for week ${req.params.weekId}:`, error);
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
        console.error(`Error getting material ${req.params.materialId}:`, error);
        res.status(500).json({ message: `Failed to get material: ${error.message}` });
    }
};

export const updateMaterial = async (req, res) => {

     let uploadedFileInfo = null;
    let existingMaterial = null;
    let oldStoragePathToDelete = null;

    try {
        const { materialId } = req.params;
        const materialData = req.body;
        const file = req.file;

        existingMaterial = await MaterialModel.getMaterialById(materialId);
        if (!existingMaterial) {
             return res.status(404).json({ message: "Material not found" });
        }

        const typeChanged = materialData.type && materialData.type !== existingMaterial.type;

        if (materialData.type === 'reading' && file) {
            console.log("New file uploaded for update, processing...");
            uploadedFileInfo = await uploadFileToStorage(file, existingMaterial.weekId, materialId);
            if (!uploadedFileInfo) {
                throw new Error("New file upload failed during material update.");
            }
             if (existingMaterial.storagePath) {
                 oldStoragePathToDelete = existingMaterial.storagePath;
             }
        }

        let finalContentUrl = existingMaterial.contentUrl;
        let finalStoragePath = existingMaterial.storagePath;

        if (typeChanged) {
            if (materialData.type === 'reading') {
                finalContentUrl = uploadedFileInfo?.downloadURL || null;
                finalStoragePath = uploadedFileInfo?.filePath || null;
            } else {
                finalContentUrl = materialData.contentUrl || null;
                finalStoragePath = null;
                 if (existingMaterial.type === 'reading' && existingMaterial.storagePath) {
                    oldStoragePathToDelete = existingMaterial.storagePath;
                }
            }
        } else {
             if (materialData.type === 'reading') {
                 if (uploadedFileInfo) {
                     finalContentUrl = uploadedFileInfo.downloadURL;
                     finalStoragePath = uploadedFileInfo.filePath;
                 }
             } else {
                 finalContentUrl = materialData.contentUrl !== undefined ? materialData.contentUrl : existingMaterial.contentUrl;
                 finalStoragePath = null;
             }
        }

        const dataToUpdate = {
            ...materialData,
            contentUrl: finalContentUrl,
            storagePath: finalStoragePath,
        };

        const updatedMaterial = await MaterialModel.updateMaterial(materialId, dataToUpdate);

        if (oldStoragePathToDelete) {
            console.log(`DB updated, deleting old file: ${oldStoragePathToDelete}`);
            await deleteFileFromStorage(oldStoragePathToDelete);
        }

        res.status(200).json({ message: "Material updated successfully", material: updatedMaterial });

    } catch (error) {
        console.error(`Error updating material ${req.params.materialId}:`, error);
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
        if (!material) return res.status(404).json({ message: "Material not found." });

        await MaterialModel.deleteMaterial(materialId);

        if (material.storagePath) {
             console.log(`DB record deleted, deleting file from storage: ${material.storagePath}`);
             await deleteFileFromStorage(material.storagePath);
        }

        res.status(200).json({ message: "Material deleted successfully." });
    } catch (error) {
        console.error(`Error deleting material ${req.params.materialId}:`, error);
        res.status(500).json({ message: `Failed to delete material: ${error.message}` });
    }
};