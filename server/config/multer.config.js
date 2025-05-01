import multer from 'multer';

const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const allowedSubtypes = ALLOWED_MIME_TYPES.map(type => type.split('/')[1]).join(', ');
    cb(new Error(`Invalid file type, allowed types are: ${allowedSubtypes}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10
  }
});

export default upload;