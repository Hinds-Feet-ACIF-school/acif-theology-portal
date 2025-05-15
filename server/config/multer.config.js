import multer from 'multer';

// MODIFIED: Expanded to include common image and video MIME types
const ALLOWED_MIME_TYPES = [
    // Existing document types
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Image types
    'image/jpeg',       // .jpg, .jpeg
    'image/png',        // .png
    'image/gif',        // .gif
    'image/webp',       // .webp
    'image/svg+xml',    // .svg (if you want to allow SVGs)

    // Video types
    'video/mp4',        // .mp4
    'video/mpeg',       // .mpeg (can also be .mpg)
    'video/ogg',        // .ogv (Ogg video)
    'video/webm',       // .webm
    'video/quicktime',  // .mov
    'video/x-msvideo',  // .avi (less common for web but might be needed)
    'video/x-flv',      // .flv
    'video/x-matroska', // .mkv
    // Add any other specific video MIME types you need to support
];

const storage = multer.memoryStorage(); // Using memoryStorage is fine for smaller files or if you process and stream to S3 immediately.
                                      // For very large files directly to S3, multer-s3 might be more efficient.

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    // console.warn(`Rejected file: ${file.originalname}, MIME type: ${file.mimetype}`); // Optional: for server-side logging
    // MODIFIED: More user-friendly error message
    cb(new Error('Invalid file type. Please upload a supported image, video, or document format.'), false); // Reject the file
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    // MODIFIED: Increased file size limit significantly for videos. Adjust as needed.
    // 10MB (original) is likely too small for most videos.
    // This is 100MB. You might need 200MB, 500MB, or more depending on your video content.
    fileSize: 1024 * 1024 * 100 // 100MB
    // For even larger files, consider streaming uploads directly to cloud storage (e.g., using multer-s3)
    // or implementing chunked uploads. Render also has a request body size limit (default 100MB, configurable).
  }
});

export default upload;