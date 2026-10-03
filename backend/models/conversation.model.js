const mongoose = require('mongoose');

// İki kullanıcı arasındaki birebir konuşma. Her kullanıcı çifti için tek konuşma olur (participantsKey benzersiz).
const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    // Sıralı iki kullanıcı id'si ("a:b"): aynı çift için ikinci konuşma açılmasını engeller.
    participantsKey: { type: String, required: true, unique: true },
    // Konuşma listesinde gösterilen son mesaj özeti. Henüz mesaj yoksa konuşma listede görünmez.
    lastMessage: {
      text: { type: String, default: '' },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      hasNote: { type: Boolean, default: false },
      createdAt: { type: Date },
    },
    lastMessageAt: { type: Date, index: true },
    // Kullanıcı id'si -> okunmamış mesaj sayısı.
    unreadCounts: { type: Map, of: Number, default: {} },
    // Kullanıcı id'si -> konuşmayı kendi tarafında sildiği an. Bu andan önceki mesajları o kullanıcı görmez;
    // yeni mesaj gelince konuşma listesinde tekrar belirir.
    clearedAt: { type: Map, of: Date, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

conversationSchema.statics.keyFor = (a, b) => [String(a), String(b)].sort().join(':');

conversationSchema.methods.hasParticipant = function hasParticipant(userId) {
  return this.participants.some((id) => id.equals(userId));
};

conversationSchema.methods.otherParticipant = function otherParticipant(userId) {
  return this.participants.find((id) => !id.equals(userId));
};

module.exports = mongoose.model('Conversation', conversationSchema);
