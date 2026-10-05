const mongoose = require('mongoose');
const { requireEmailVerification } = require('../config/features');

const EDU_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.tr$/;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      // .edu.tr şartı (REQUIRE_EDU_EMAIL) validations/auth.validation.js'te uygulanır.
    },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true },
    university: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Engellenen kullanıcılar: birbirine mesaj atamaz, takip edemez; engelleyen kişi onların aramasında çıkmaz.
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Kaydedilen (yer imi) notlar: sadece kullanıcının kendisi görür.
    savedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
    // Son istek zamanı ("Active now" listesi için; auth middleware'de en fazla dakikada bir güncellenir).
    lastActiveAt: { type: Date, index: true },
    // Kurumsal e-posta doğrulaması: doğrulanmamış kullanıcı giriş yapabilir ama
    // not yükleme / indirme / beğeni / yorum / takip yapamaz.
    isVerified: { type: Boolean, default: false },
    verificationTokenHash: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Başka kullanıcıların görebileceği profil görünümü.
userSchema.methods.toPublicJSON = function toPublicJSON() {
  const { _id, fullName, university, department, avatarUrl, bio, followers, following, createdAt } = this;
  return {
    id: _id,
    fullName,
    university,
    department,
    avatarUrl,
    bio,
    followersCount: followers.length,
    followingCount: following.length,
    createdAt,
  };
};

// Kullanıcının kendi hesabı için (e-posta ve doğrulama durumu dahil) döndürülen görünüm.
userSchema.methods.toSafeJSON = function toSafeJSON() {
  return { ...this.toPublicJSON(), email: this.email, isVerified: this.hasVerifiedAccess() };
};

// Doğrulama şartı kapalıyken (REQUIRE_EMAIL_VERIFICATION=false) herkes doğrulanmış sayılır.
userSchema.methods.hasVerifiedAccess = function hasVerifiedAccess() {
  return this.isVerified || !requireEmailVerification();
};

userSchema.statics.EDU_EMAIL_REGEX = EDU_EMAIL_REGEX;

module.exports = mongoose.model('User', userSchema);
