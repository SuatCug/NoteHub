const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

// Dosya depolama katmanı. .env'de CLOUDINARY_URL varsa yeni dosyalar Cloudinary'ye, yoksa yerel diske
// (backend/uploads) yazılır. Okuma/silme anahtarın biçimine göre doğru yere gider; böylece Cloudinary'ye
// geçmeden önce diske yüklenmiş eski dosyalar da çalışmaya devam eder.
// Controller'lar dosya konumunu Note.fileUrl / User.avatarUrl alanında saklar ve buradan okur.
//
// Anahtar biçimleri:
//   notes/abc.pdf                             -> yerel disk
//   /uploads/avatars/abc.png                  -> yerel disk (herkese açık, bkz. index.js)
//   cloudinary-image:notehub/notes/abc.pdf    -> Cloudinary "image" tipi, gizli (PDF / JPG / PNG)
//   cloudinary:notehub/notes/abc.docx         -> Cloudinary "raw" tipi, gizli (DOCX / ZIP / RAR)
//   https://res.cloudinary.com/.../x.png      -> Cloudinary, herkese açık avatar
// Anahtar her zaman dosya uzantısıyla biter (önizlemenin içerik tipi buradan belirlenir).

const useCloudinary = Boolean(process.env.CLOUDINARY_URL);
// SDK, CLOUDINARY_URL ortam değişkenini kendisi okur; sadece https URL üretmesini istiyoruz.
if (useCloudinary) cloudinary.config({ secure: true });

const RAW_PREFIX = 'cloudinary:';
const IMAGE_PREFIX = 'cloudinary-image:';
const CLOUDINARY_FOLDER = 'notehub';
// Cloudinary'nin "image" olarak işleyebildiği türler: panelde küçük resimleriyle görünürler.
const IMAGE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

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

// Gizli Cloudinary anahtarını SDK'nın beklediği parçalara ayırır; Cloudinary anahtarı değilse null.
// "image" tipinde public_id uzantı içermez, "raw" tipinde içerir.
const parseCloudinaryKey = (key) => {
  if (key.startsWith(IMAGE_PREFIX)) {
    const file = key.slice(IMAGE_PREFIX.length);
    const ext = path.extname(file);
    return { resourceType: 'image', publicId: file.slice(0, -ext.length), format: ext.slice(1) };
  }
  if (key.startsWith(RAW_PREFIX)) {
    return { resourceType: 'raw', publicId: key.slice(RAW_PREFIX.length), format: '' };
  }
  return null;
};

const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (error, result) => (error ? reject(error) : resolve(result))).end(buffer);
  });

// Not dosyaları "authenticated" tipinde yüklenir: doğrudan URL ile açılamaz, sadece backend tarafından
// okunabilir. Böylece gizli grup notları /api/notes/:id/download'daki yetki kontrolünü atlayamaz.
const saveNoteFile = async (buffer, ext) => {
  const fileName = randomFileName(ext);

  if (useCloudinary) {
    const isImage = IMAGE_EXTENSIONS.includes(ext);
    const baseId = `${CLOUDINARY_FOLDER}/notes/${path.basename(fileName, ext)}`;
    const result = await uploadToCloudinary(buffer, {
      resource_type: isImage ? 'image' : 'raw',
      type: 'authenticated',
      public_id: isImage ? baseId : `${baseId}${ext}`,
    });
    return isImage ? `${IMAGE_PREFIX}${result.public_id}${ext}` : `${RAW_PREFIX}${result.public_id}`;
  }

  await fs.mkdir(NOTES_DIR, { recursive: true });
  await fs.writeFile(path.join(NOTES_DIR, fileName), buffer);
  return `notes/${fileName}`;
};

// Avatarlar herkese açıktır; Cloudinary'de en fazla 512x512'ye küçültülerek saklanır.
const saveAvatar = async (buffer, ext) => {
  if (useCloudinary) {
    const result = await uploadToCloudinary(buffer, {
      resource_type: 'image',
      folder: `${CLOUDINARY_FOLDER}/avatars`,
      transformation: [{ width: 512, height: 512, crop: 'limit' }],
    });
    return result.secure_url;
  }

  const fileName = randomFileName(ext);
  await fs.mkdir(AVATARS_DIR, { recursive: true });
  await fs.writeFile(path.join(AVATARS_DIR, fileName), buffer);
  return `/uploads/avatars/${fileName}`;
};

// Not dosyasının içeriğini Buffer olarak döndürür; dosya bulunamazsa null.
const readNoteFile = async (key) => {
  const cld = parseCloudinaryKey(key);
  if (cld) {
    // İmzalı teslim URL'i (cloudinary.url + sign_url) hesap güvenlik ayarları yüzünden 401 dönüyor;
    // API üzerinden kısa ömürlü indirme bağlantısı her hesapta çalışıyor ve dosyayı birebir döndürüyor.
    const url = cloudinary.utils.private_download_url(cld.publicId, cld.format, {
      resource_type: cld.resourceType,
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + 60,
    });
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Cloudinary download failed (${res.status}).`);
    return Buffer.from(await res.arrayBuffer());
  }

  try {
    return await fs.readFile(resolveKey(key));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

// https://res.cloudinary.com/<cloud>/image/upload/v123/notehub/avatars/abc.png -> notehub/avatars/abc
const avatarPublicId = (url) => url.match(/\/image\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i)?.[1];

// Silme hataları (dosya zaten yoksa vb.) asıl işlemi bozmamalı; sadece loglanır.
const removeFile = async (key) => {
  if (!key) return;
  try {
    const cld = parseCloudinaryKey(key);
    if (cld) {
      await cloudinary.uploader.destroy(cld.publicId, { resource_type: cld.resourceType, type: 'authenticated' });
    } else if (key.startsWith('https://res.cloudinary.com/')) {
      const publicId = avatarPublicId(key);
      if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } else {
      await fs.unlink(resolveKey(key.replace(/^\/uploads\//, '')));
    }
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Dosya silinemedi:', key, error.message);
  }
};

module.exports = { saveNoteFile, saveAvatar, readNoteFile, removeFile };
