// Yerel diskteki (backend/uploads) not dosyalarını ve avatarları Cloudinary'ye taşır; ayrıca eski "raw" olarak
// yüklenmiş PDF/JPG/PNG notlarını panelde küçük resimleriyle görünen "image" tipine çevirir.
// Diskteki dosyalar silinmez (yedek olarak kalır). Tekrar çalıştırmak güvenlidir: taşınmış kayıtlar atlanır.
// Kullanım: npm run migrate:cloudinary
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { Note, User } = require('../models');
const { saveNoteFile, saveAvatar, readNoteFile, removeFile } = require('../services/storage.service');
const { getExtension } = require('../utils/fileTypes.util');

const IMAGE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const needsMigration = (key) => {
  if (key.startsWith('cloudinary-image:')) return false;
  if (key.startsWith('cloudinary:')) return IMAGE_EXTENSIONS.includes(getExtension(key));
  return true;
};

const migrateNotes = async () => {
  const notes = await Note.find().select('+fileUrl title');
  let moved = 0;
  for (const note of notes) {
    const oldKey = note.fileUrl;
    if (!needsMigration(oldKey)) continue;

    const buffer = await readNoteFile(oldKey);
    if (!buffer) {
      console.warn(`  ! Dosya bulunamadı, atlandı: ${note.title} (${oldKey})`);
      continue;
    }
    const newKey = await saveNoteFile(buffer, getExtension(oldKey));
    await Note.updateOne({ _id: note._id }, { fileUrl: newKey });
    // Yerel dosyalar yedek olarak kalır; sadece Cloudinary'deki eski "raw" kopya silinir.
    if (oldKey.startsWith('cloudinary:')) await removeFile(oldKey);
    moved += 1;
    console.log(`  ✓ ${note.title}`);
  }
  return moved;
};

const migrateAvatars = async () => {
  const users = await User.find({ avatarUrl: /^\/uploads\// }).select('fullName avatarUrl');
  let moved = 0;
  for (const user of users) {
    const buffer = await readNoteFile(user.avatarUrl.replace(/^\/uploads\//, ''));
    if (!buffer) {
      console.warn(`  ! Avatar bulunamadı, atlandı: ${user.fullName}`);
      continue;
    }
    const url = await saveAvatar(buffer, getExtension(user.avatarUrl));
    await User.updateOne({ _id: user._id }, { avatarUrl: url });
    moved += 1;
    console.log(`  ✓ ${user.fullName}`);
  }
  return moved;
};

const run = async () => {
  if (!process.env.CLOUDINARY_URL) {
    console.error('CLOUDINARY_URL tanımlı değil; önce backend/.env dosyasına ekleyin.');
    process.exit(1);
  }
  await connectDB();
  console.log('Notlar taşınıyor...');
  const notes = await migrateNotes();
  console.log('Avatarlar taşınıyor...');
  const avatars = await migrateAvatars();
  console.log(`Bitti: ${notes} not, ${avatars} avatar taşındı.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Taşıma başarısız:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
