import { Schema, model, type HydratedDocumentFromSchema, type Types } from 'mongoose';

// İki kullanıcı arasındaki birebir konuşma. Her kullanıcı çifti için tek konuşma olur (participantsKey benzersiz).
const conversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    // Sıralı iki kullanıcı id'si ("a:b"): aynı çift için ikinci konuşma açılmasını engeller.
    participantsKey: { type: String, required: true, unique: true },
    // Konuşma listesinde gösterilen son mesaj özeti. Henüz mesaj yoksa konuşma listede görünmez.
    lastMessage: {
      text: { type: String, default: '' },
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
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
  {
    timestamps: { createdAt: true, updatedAt: false },
    statics: {
      keyFor(a: Types.ObjectId | string, b: Types.ObjectId | string) {
        return [String(a), String(b)].sort().join(':');
      },
    },
    methods: {
      hasParticipant(userId: Types.ObjectId | string) {
        return this.participants.some((id) => id.equals(userId));
      },
      otherParticipant(userId: Types.ObjectId | string) {
        return this.participants.find((id) => !id.equals(userId));
      },
    },
  }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

export const Conversation = model('Conversation', conversationSchema);
export type ConversationDocument = HydratedDocumentFromSchema<typeof conversationSchema>;
export default Conversation;
