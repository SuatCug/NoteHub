import mongoose from 'mongoose';

// İletişim formundan gelen mesajlar. Şimdilik veritabanında saklanır (yönetim paneli / e-posta bildirimi yok).
const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    topic: { type: String, required: true, enum: ['general', 'support', 'copyright', 'privacy', 'feedback'] },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    // Giriş yapmış bir kullanıcı gönderdiyse.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['new', 'resolved'], default: 'new' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessage;
