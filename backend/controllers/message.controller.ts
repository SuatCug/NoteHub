import asyncHandler, { type AuthedRequest } from '../utils/asyncHandler.ts';
import ApiError from '../utils/apiError.ts';
import { User, Note, Conversation, DirectMessage } from '../models/index.ts';
import { assertNoteVisible } from '../services/note.service.ts';
import { isBlockedBetween } from '../services/block.service.ts';
import { emitToUsers } from '../services/realtime.service.ts';
import type { Types } from 'mongoose';
import type { ConversationDocument } from '../models/conversation.model.ts';

const USER_CARD_FIELDS = 'fullName avatarUrl university department';
const NOTE_CARD_FIELDS = 'title courseCode courseName fileType';
const MESSAGE_LIMIT = 100;
const CONVERSATION_LIMIT = 100;

// Sadece katılımcıların görebildiği konuşma; değilse konuşma yokmuş gibi 404 döner.
const findConversationOrFail = async (id: string, userId: string) => {
  const conversation = await Conversation.findById(id);
  if (!conversation || !conversation.hasParticipant(userId)) throw new ApiError(404, 'Conversation not found.');
  return conversation;
};

// Konuşmanın diğer katılımcısı (her konuşmada iki katılımcı vardır).
const otherParticipantOf = (conversation: ConversationDocument, userId: string) => {
  const other = conversation.otherParticipant(userId);
  if (!other) throw new ApiError(404, 'Conversation not found.');
  return other;
};

// Map alanları dokümanda Map, .lean() sonucunda düz obje olarak gelir.
type UserIdMap<T> = Map<string, T> | Record<string, T> | null | undefined;

// Kullanıcı konuşmayı kendi tarafında sildiyse, o andan önceki mesajlar ona gösterilmez.
const clearedAtFor = (conversation: { clearedAt?: UserIdMap<Date> }, userId: string) => {
  const map = conversation.clearedAt;
  return (map instanceof Map ? map.get(userId) : map?.[userId]) || null;
};

const unreadFor = (conversation: { unreadCounts?: UserIdMap<number> }, userId: string) => {
  const map = conversation.unreadCounts;
  return (map instanceof Map ? map.get(userId) : map?.[userId]) || 0;
};

interface MessageLike {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  note?: unknown;
  createdAt: Date;
}

const toMessageJSON = (m: MessageLike) => ({
  _id: m._id,
  sender: m.sender,
  text: m.text,
  note: m.note ?? null,
  createdAt: m.createdAt,
});

// Mesajlar sayfasındaki konuşma listesi (en son mesajı olan en üstte).
const getConversations = asyncHandler<AuthedRequest>(async (req, res) => {
  const me = req.user.id;
  const conversations = await Conversation.find({ participants: me, lastMessageAt: { $ne: null } })
    .sort({ lastMessageAt: -1 })
    .limit(CONVERSATION_LIMIT)
    .populate('participants', USER_CARD_FIELDS)
    .lean();

  const items = conversations
    .filter((c) => {
      const cleared = clearedAtFor(c, me);
      return !cleared || (c.lastMessageAt != null && c.lastMessageAt > cleared);
    })
    .map((c) => ({
      _id: c._id,
      // Hesabı silinmiş kullanıcı populate sonucunda düşer; bu durumda otherUser null olur.
      otherUser: c.participants.find((p) => p && p._id.toString() !== me) ?? null,
      lastMessage: {
        text: c.lastMessage?.text ?? '',
        hasNote: Boolean(c.lastMessage?.hasNote),
        isMine: c.lastMessage?.sender?.toString() === me,
        createdAt: c.lastMessage?.createdAt ?? c.lastMessageAt,
      },
      unreadCount: unreadFor(c, me),
    }));

  res.json({ success: true, data: { conversations: items } });
});

// Navbar'daki rozet için toplam okunmamış mesaj sayısı.
const getUnreadCount = asyncHandler<AuthedRequest>(async (req, res) => {
  const me = req.user.id;
  const conversations = await Conversation.find({ participants: me, [`unreadCounts.${me}`]: { $gt: 0 } })
    .select('unreadCounts')
    .lean();

  const count = conversations.reduce((sum, c) => sum + unreadFor(c, me), 0);
  res.json({ success: true, data: { count } });
});

// Bir kullanıcıyla konuşmayı açar (yoksa oluşturur) ve id'sini döndürür.
// Mesaj atılana kadar konuşma listede görünmez.
const startConversation = asyncHandler<AuthedRequest>(async (req, res) => {
  const me = req.user.id;
  const { userId } = req.body;
  if (userId === me) throw new ApiError(400, 'You cannot message yourself.');

  const exists = await User.exists({ _id: userId });
  if (!exists) throw new ApiError(404, 'User not found.');
  if (await isBlockedBetween(me, userId)) throw new ApiError(403, 'You cannot message this user.');

  const conversation = await Conversation.findOneAndUpdate(
    { participantsKey: Conversation.keyFor(me, userId) },
    { $setOnInsert: { participants: [me, userId] } },
    { upsert: true, returnDocument: 'after' }
  );

  res.json({ success: true, data: { conversationId: conversation._id } });
});

// Konuşma detayı + son mesajlar. Açılan konuşma okunmuş sayılır.
const getConversation = asyncHandler<AuthedRequest>(async (req, res) => {
  const me = req.user.id;
  const conversation = await findConversationOrFail(req.params.id, me);
  const otherId = conversation.otherParticipant(me);

  const cleared = clearedAtFor(conversation, me);
  const [messages, otherUser, meDoc, blockedMe] = await Promise.all([
    DirectMessage.find({ conversation: conversation._id, ...(cleared && { createdAt: { $gt: cleared } }) })
      .sort({ createdAt: -1 })
      .limit(MESSAGE_LIMIT)
      .populate('note', NOTE_CARD_FIELDS)
      .lean(),
    User.findById(otherId).select(USER_CARD_FIELDS).lean(),
    User.findById(me).select('blockedUsers').lean(),
    User.exists({ _id: otherId, blockedUsers: me }),
  ]);

  const markedRead = unreadFor(conversation, me) > 0;
  if (markedRead) {
    await Conversation.updateOne({ _id: conversation._id }, { $set: { [`unreadCounts.${me}`]: 0 } });
    // Kullanıcının diğer sekmelerindeki okunmamış rozeti de düşsün.
    emitToUsers(me, 'message:changed', { conversationId: String(conversation._id) });
  }

  res.json({
    success: true,
    data: {
      conversation: {
        _id: conversation._id,
        otherUser: otherUser ?? null,
        blockedByMe: Boolean(meDoc?.blockedUsers?.some((id) => id.equals(otherId))),
        blockedMe: Boolean(blockedMe),
      },
      messages: messages.reverse().map(toMessageJSON),
      // İstemci bu durumda okunmamış rozetini ve konuşma listesini yeniler.
      markedRead,
    },
  });
});

const sendMessage = asyncHandler<AuthedRequest>(async (req, res) => {
  const me = req.user.id;
  const conversation = await findConversationOrFail(req.params.id, me);
  const otherId = otherParticipantOf(conversation, me);

  if (!(await User.exists({ _id: otherId }))) throw new ApiError(404, 'This user no longer exists.');
  if (await isBlockedBetween(me, otherId)) throw new ApiError(403, 'You cannot message this user.');

  // Eklenen not hem gönderene hem alıcıya görünür olmalı (grup notları sadece grup üyelerine görünür).
  let noteId;
  if (req.body.noteId) {
    const note = await Note.findById(req.body.noteId).select('group author visibility');
    if (!note) throw new ApiError(404, 'Note not found.');
    await assertNoteVisible(note, me);
    try {
      await assertNoteVisible(note, otherId.toString());
    } catch {
      throw new ApiError(403, "The recipient can't see this note (it's shared with a group or only with the author's followers).");
    }
    noteId = note._id;
  }

  const message = await DirectMessage.create({
    conversation: conversation._id,
    sender: me,
    text: req.body.text,
    note: noteId,
  });

  await Conversation.updateOne(
    { _id: conversation._id },
    {
      $set: {
        lastMessage: { text: message.text, sender: me, hasNote: Boolean(noteId), createdAt: message.createdAt },
        lastMessageAt: message.createdAt,
      },
      $inc: { [`unreadCounts.${otherId}`]: 1 },
    }
  );

  await message.populate('note', NOTE_CARD_FIELDS);
  // İki tarafın da açık sekmeleri konuşmayı ve okunmamış sayısını anında yeniler.
  emitToUsers([me, otherId], 'message:changed', { conversationId: String(conversation._id) });
  res.status(201).json({ success: true, data: { message: toMessageJSON(message) } });
});

// Mesajı geri alma: sadece gönderen silebilir, iki taraftan da kalkar.
const deleteMessage = asyncHandler<AuthedRequest>(async (req, res) => {
  const me = req.user.id;
  const conversation = await findConversationOrFail(req.params.id, me);

  const message = await DirectMessage.findOne({ _id: req.params.messageId, conversation: conversation._id });
  if (!message) throw new ApiError(404, 'Message not found.');
  if (!message.sender.equals(me)) throw new ApiError(403, 'You can only delete your own messages.');
  await message.deleteOne();

  // Liste özetini kalan son mesaja göre güncelle; alıcı henüz okumadıysa okunmamış sayısını düşür.
  const otherId = otherParticipantOf(conversation, me).toString();
  const latest = await DirectMessage.findOne({ conversation: conversation._id }).sort({ createdAt: -1 }).lean();
  const update: { $set?: Record<string, unknown>; $unset?: Record<string, 1> } = latest
    ? {
        $set: {
          lastMessage: {
            text: latest.text,
            sender: latest.sender,
            hasNote: Boolean(latest.note),
            createdAt: latest.createdAt,
          },
          lastMessageAt: latest.createdAt,
        },
      }
    : { $unset: { lastMessage: 1, lastMessageAt: 1 } };
  const otherUnread = unreadFor(conversation, otherId);
  if (otherUnread > 0) update.$set = { ...update.$set, [`unreadCounts.${otherId}`]: otherUnread - 1 };
  await Conversation.updateOne({ _id: conversation._id }, update);
  emitToUsers([me, otherId], 'message:changed', { conversationId: String(conversation._id) });

  res.json({ success: true, message: 'Message deleted.' });
});

// Konuşmayı sadece kendi tarafında siler (karşı taraf görmeye devam eder).
const deleteConversation = asyncHandler<AuthedRequest>(async (req, res) => {
  const me = req.user.id;
  const conversation = await findConversationOrFail(req.params.id, me);

  await Conversation.updateOne(
    { _id: conversation._id },
    { $set: { [`clearedAt.${me}`]: new Date(), [`unreadCounts.${me}`]: 0 } }
  );

  res.json({ success: true, message: 'Conversation deleted.' });
});

export {
  getConversations,
  getUnreadCount,
  startConversation,
  getConversation,
  sendMessage,
  deleteMessage,
  deleteConversation,
};

