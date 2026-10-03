const multer = require('multer');
const ApiError = require('../utils/apiError');
const { NOTE_FILE_TYPES, AVATAR_EXTENSIONS, getExtension } = require('../utils/fileTypes.util');

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 25) * 1024 * 1024;
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

// Dosyalar önce belleğe alınır; doğrulama başarılı olursa controller storage servisi ile kalıcı hale getirir.
// Böylece validasyon hatasında diskte artık dosya kalmaz.
const createUploader = (allowedExtensions, maxSize, errorMessage) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSize, files: 1 },
    fileFilter: (req, file, cb) => {
      if (!allowedExtensions.includes(getExtension(file.originalname))) {
        return cb(new ApiError(415, errorMessage));
      }
      cb(null, true);
    },
  });

const uploadNoteFile = createUploader(
  Object.keys(NOTE_FILE_TYPES),
  MAX_FILE_SIZE,
  'Unsupported file type. Allowed: PDF, DOCX, JPG, PNG, ZIP, RAR.'
).single('file');

const uploadAvatar = createUploader(AVATAR_EXTENSIONS, MAX_AVATAR_SIZE, 'Profile photo must be a JPG or PNG.').single(
  'avatar'
);

module.exports = { uploadNoteFile, uploadAvatar };
