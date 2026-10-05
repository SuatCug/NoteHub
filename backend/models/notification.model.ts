const mongoose = require('mongoose');

// Kullanıcıya gösterilen bildirimler (beğeni, yorum, takip, grup katılımı).
// Tekrarlayan olaylar (aynı kişinin aynı notu beğenmesi gibi) tek kayıt olarak tutulur; bkz. services/notification.service.js
const NOTIFICATION_TYPES = ['like', 'comment', 'follow', 'group_join', 'group_request', 'group_approved'];

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: NOTIFICATION_TYPES },
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    text: { type: String, maxlength: 140 }, // Yorum bildirimlerinde yorumun başı
    read: { type: Boolean, default: false },
    // Eski bildirimler 90 gün sonra MongoDB tarafından otomatik silinir (TTL index).
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 },
  },
  { versionKey: false }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
