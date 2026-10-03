const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

// Dosya depolama katmanı. Şimdilik yerel disk (backend/uploads) kullanılıyor; ileride AWS S3 /
// Cloudinary / Uploadthing'e geçmek için sadece bu dosyadaki fonksiyonların değiştirilmesi yeterli.
// Controller'lar dosya konumunu Note.fileUrl / User.avatarUrl alanında saklar ve buradan okur.

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const NOTES_DIR = path.join(UPLOAD_ROOT, 'notes');
const AVATARS_DIR = path.join(UPLOAD_ROOT, 'avatars');

const randomFileName = (ext) => `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${ext}`;

// "notes/abc.pdf" gibi bir anahtarı uploads klasörü dışına çıkamayacak şekilde mutlak yola çevirir.
const resolveKey = (key) => {
  const fullPath = path.resolve(UPLOAD_ROOT, key);
  if (!fullPath.startsWith(UPLOAD_ROOT + path.sep)) {
    throw new Error('Invalid file path.');
  }
  return fullPath;
};

const saveNoteFile = async (buffer, ext) => {
  const fileName = randomFileName(ext);
  await fs.mkdir(NOTES_DIR, { recursive: true });
  await fs.writeFile(path.join(NOTES_DIR, fileName), buffer);
  return `notes/${fileName}`;
};

// Avatarlar /uploads/avatars altında herkese açık servis edilir (bkz. index.js).
const saveAvatar = async (buffer, ext) => {
  const fileName = randomFileName(ext);
  await fs.mkdir(AVATARS_DIR, { recursive: true });
  await fs.writeFile(path.join(AVATARS_DIR, fileName), buffer);
  return `/uploads/avatars/${fileName}`;
};

const getNoteFilePath = (key) => resolveKey(key);

// Silme hataları (dosya zaten yoksa vb.) asıl işlemi bozmamalı; sadece loglanır.
const removeFile = async (key) => {
  if (!key) return;
  try {
    await fs.unlink(resolveKey(key.replace(/^\/uploads\//, '')));
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Dosya silinemedi:', key, error.message);
  }
};

module.exports = { saveNoteFile, saveAvatar, getNoteFilePath, removeFile };
