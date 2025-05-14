// backend/routes/upload.routes.js
import express from 'express';
import multer from 'multer';
// Corrected import: Remove 'uploadBytesResumable' and 'getDownloadURL'
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 200 * 1024 * 1024 } // Example: 200MB limit
});

router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        const bucket = getStorage().bucket(); // Get default bucket
        const fileExtension = path.extname(req.file.originalname);
        const fileName = `uploads/${uuidv4()}${fileExtension}`; // Unique path in the bucket

        const fileRef = bucket.file(fileName); // Reference to the file in Firebase Storage

        // Create a write stream to upload the file buffer
        const blobStream = fileRef.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
            },
            resumable: false, // For simpler uploads with memory storage. Set true for very large files if needed.
        });

        blobStream.on('error', (err) => {
            console.error('Firebase Storage upload error (blobStream):', err);
            return res.status(500).json({ message: 'Could not upload the file to Firebase Storage.' });
        });

        blobStream.on('finish', async () => {
            try {
                // After upload finishes, make the file public or get a signed URL

                // Option 1: Make the file public
                await fileRef.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                res.status(200).json({ url: publicUrl });

                // Option 2: Get a signed URL (more secure for confidential content)
                /*
                const [signedUrl] = await fileRef.getSignedUrl({
                    action: 'read',
                    expires: '03-01-2500', // Set an appropriate expiration date
                });
                res.status(200).json({ url: signedUrl });
                */

            } catch (error) {
                console.error('Error making file public or getting signed URL:', error);
                return res.status(500).json({ message: 'File uploaded but failed to get URL.' });
            }
        });

        // End the stream by writing the file buffer
        blobStream.end(req.file.buffer);

    } catch (error) {
        console.error('Firebase Storage upload error (main try-catch):', error);
        res.status(500).json({ message: 'Failed to process file upload.' });
    }
});

export default router;