const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadRoot = path.resolve(__dirname, '../../uploads/exercises');
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const videoTypes = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const folder = req.params.id || req.uploadFolder || crypto.randomUUID();
    req.uploadFolder = folder;
    const destination = path.join(uploadRoot, folder);
    fs.mkdir(destination, { recursive: true }, (error) => callback(error, destination));
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = file.fieldname === 'coverImage'
      ? 'cover'
      : file.fieldname === 'targetMusclesImage'
        ? 'target-muscles'
        : file.fieldname.replace('Video', '');
    callback(null, `${baseName}-${crypto.randomUUID()}${extension}`);
  },
});

const fileFilter = (req, file, callback) => {
  const isImage = file.fieldname === 'coverImage' || file.fieldname === 'targetMusclesImage';
  const allowed = isImage ? imageTypes : videoTypes;
  if (!allowed.has(file.mimetype)) {
    return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
  }
  return callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024, files: 5 },
});

const exerciseUpload = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'targetMusclesImage', maxCount: 1 },
  { name: 'frontVideo', maxCount: 1 },
  { name: 'sideVideo', maxCount: 1 },
  { name: 'topVideo', maxCount: 1 },
]);

const attachUploadedUrls = (req, res, next) => {
  Object.values(req.files || {}).flat().forEach((file) => {
    const folder = path.basename(path.dirname(file.path));
    file.url = `/uploads/exercises/${folder}/${file.filename}`;
  });
  next();
};

module.exports = { exerciseUpload, attachUploadedUrls };
