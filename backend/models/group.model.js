const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: '', trim: true, maxlength: 1000 },
    // Grubun kurucusu: grubu düzenleyebilir, silebilir ve üyeleri çıkarabilir. Kurucu da members içindedir.
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    // Özel grup: katılmak için kurucunun onayı gerekir; notlar, üyeler ve sohbet sadece üyelere görünür.
    isPrivate: { type: Boolean, default: false },
    // Özel gruba gönderilmiş, kurucunun onayını bekleyen katılma istekleri.
    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

groupSchema.index({ createdAt: -1 });

groupSchema.methods.hasMember = function hasMember(userId) {
  return Boolean(userId) && this.members.some((id) => id.equals(userId));
};

groupSchema.methods.hasPendingRequest = function hasPendingRequest(userId) {
  return Boolean(userId) && this.joinRequests.some((id) => id.equals(userId));
};

module.exports = mongoose.model('Group', groupSchema);
