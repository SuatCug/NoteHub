const path = require('path');

// İzin verilen uzantılar ve Note.fileType karşılıkları.
const NOTE_FILE_TYPES = {
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.zip': 'archive',
  '.rar': 'archive',
};

const AVATAR_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

// Dosyanın ilk byte'larına (magic number) bakarak uzantının gerçekten içerikle uyuştuğunu doğrular.
// Böylece örn. .pdf uzantısı verilmiş bir .exe dosyası reddedilir.
const SIGNATURES = {
  '.pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  '.png': [[0x89, 0x50, 0x4e, 0x47]],
  '.jpg': [[0xff, 0xd8, 0xff]],
  '.jpeg': [[0xff, 0xd8, 0xff]],
  '.zip': [[0x50, 0x4b, 0x03, 0x04]], // PK..
  '.docx': [[0x50, 0x4b, 0x03, 0x04]], // DOCX aslında bir ZIP arşividir
  '.rar': [[0x52, 0x61, 0x72, 0x21]], // Rar!
};

const getExtension = (filename) => path.extname(filename || '').toLowerCase();

const matchesSignature = (buffer, ext) => {
  const signatures = SIGNATURES[ext];
  if (!signatures) return false;
  return signatures.some((sig) => buffer.length >= sig.length && sig.every((byte, i) => buffer[i] === byte));
};

module.exports = { NOTE_FILE_TYPES, AVATAR_EXTENSIONS, getExtension, matchesSignature };
