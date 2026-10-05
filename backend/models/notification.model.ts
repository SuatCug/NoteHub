import { Schema, model } from 'mongoose';

// Kullanıcıya gösterilen bildirimler (beğeni, yorum, takip, grup katılımı).
// Tekrarlayan olaylar (aynı kişinin aynı notu beğenmesi gibi) tek kayıt olarak tutulur; bkz. services/notification.service.ts
export const NOTIFICATION_TYPES = ['like', 'comment', 'follow', 'group_join', 'group_request', 'group_approved'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: NOTIFICATION_TYPES },
    note: { type: Schema.Types.ObjectId, ref: 'Note' },
    group: { type: Schema.Types.ObjectId, ref: 'Group' },
    text: { type: String, maxlength: 140 }, // Yorum bildirimlerinde yorumun başı
    read: { type: Boolean, default: false },
    // Eski bildirimler 90 gün sonra MongoDB tarafından otomatik silinir (TTL index).
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 },
  },
  { versionKey: false }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

export const Notification = model('Notification', notificationSchema);
export default Notification;
