// server/routes/upload.routes.js
import express from 'express';
import multer from 'multer';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js'; // IMPORT auth middleware

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 200 * 1024 * 1024 }
});

// ADDED verifyToken and isAdmin middleware here
router.post('/upload', verifyToken, isAdmin, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Your existing Firebase Storage upload logic
    try {
        const bucket = getStorage().bucket();
        const fileExtension = path.extname(req.file.originalname);
        const folder = 'site_content_assets/'; // Optional: specific folder for these assets
        const fileName = `${folder}${uuidv4()}${fileExtension}`;

        const fileRef = bucket.file(fileName);

        const blobStream = fileRef.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
            },
            resumable: false,
        });

        blobStream.on('error', (err) => {
            console.error('Firebase Storage upload error (blobStream):', err);
            return res.status(500).json({ message: 'Could not upload the file to Firebase Storage.' });
        });

        blobStream.on('finish', async () => {
            try {
                await fileRef.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                res.status(200).json({ url: publicUrl, message: "File uploaded successfully" });
            } catch (error) {
                console.error('Error making file public or getting signed URL:', error);
                return res.status(500).json({ message: 'File uploaded but failed to get URL.' });
            }
        });

        blobStream.end(req.file.buffer);

    } catch (error) {
        console.error('Firebase Storage upload error (main try-catch):', error);
        res.status(500).json({ message: 'Failed to process file upload.' });
    }
});

export default router;