const mongoose = require('mongoose');

// Grup sohbeti mesajları. Sadece grup üyeleri okuyup yazabilir.
const groupMessageSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

groupMessageSchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('GroupMessage', groupMessageSchema);
