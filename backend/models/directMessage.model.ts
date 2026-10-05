import mongoose from 'mongoose';

// Birebir konuşma mesajı. İsteğe bağlı olarak bir not eklenebilir ("Ask the author" ile başlatılan konuşmalar).
const directMessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

directMessageSchema.index({ conversation: 1, createdAt: -1 });

export const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
export default DirectMessage;
