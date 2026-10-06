import mongoose from 'mongoose';

// Birebir konuşma mesajı. İsteğe bağlı olarak bir not eklenebilir ("Ask the author" ile başlatılan konuşmalar).
const directMessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    // Yanıtlanan mesajın o anki özeti: asıl mesaj sonradan silinse de alıntı görünmeye devam eder.
    reply: {
      type: new mongoose.Schema(
        {
          message: { type: mongoose.Schema.Types.ObjectId, ref: 'DirectMessage', required: true },
          sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
          text: { type: String, default: '' },
        },
        { _id: false }
      ),
      default: undefined,
    },
    // Gönderen mesajı düzenlediyse son düzenleme zamanı.
    editedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

directMessageSchema.index({ conversation: 1, createdAt: -1 });

export const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
export default DirectMessage;
