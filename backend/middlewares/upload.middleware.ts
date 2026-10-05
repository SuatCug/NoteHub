import multer from 'multer';
import ApiError from '../utils/apiError.ts';
import { NOTE_FILE_TYPES, AVATAR_EXTENSIONS, getExtension } from '../utils/fileTypes.util.ts';

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB ?? '', 10) || 25) * 1024 * 1024;
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

// Dosyalar önce belleğe alınır; doğrulama başarılı olursa controller storage servisi ile kalıcı hale getirir.
// Böylece validasyon hatasında diskte artık dosya kalmaz.
const createUploader = (allowedExtensions: string[], maxSize: number, errorMessage: string) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSize, files: 1 },
    fileFilter: (_req, file, cb) => {
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

export { uploadNoteFile, uploadAvatar };
