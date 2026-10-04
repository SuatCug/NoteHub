const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { Group, GroupMessage, Note } = require('../models');
const { listGroups } = require('../services/group.service');
const { listNotes } = require('../services/note.service');
const { notify } = require('../services/notification.service');
const { parsePagination } = require('../utils/pagination.util');
const { wordSearchMatch } = require('../utils/regex.util');

const USER_CARD_FIELDS = 'fullName avatarUrl university department';

const findGroupOrFail = async (id) => {
  const group = await Group.findById(id);
  if (!group) throw new ApiError(404, 'Group not found.');
  return group;
};

const assertOwner = (group, userId) => {
  if (!group.owner.equals(userId)) {
    throw new ApiError(403, 'Only the group founder can do this.');
  }
};

// Özel grubun üye listesi sadece üyelere açıktır.
const assertCanView = (group, userId) => {
  if (group.isPrivate && !group.hasMember(userId)) {
    throw new ApiError(403, 'This group is private. Join the group to see its content.');
  }
};

// Grup detay görünümü: üye / istek dizileri yerine sayılar + izleyiciye göre durum bilgisi.
const toGroupDetail = async (group, viewerId) => {
  await group.populate('owner', USER_CARD_FIELDS);
  const notesCount = await Note.countDocuments({ group: group._id });
  const { members, joinRequests, __v, ...rest } = group.toObject();
  const isOwner = viewerId ? group.owner._id.equals(viewerId) : false;
  return {
    ...rest,
    membersCount: members.length,
    notesCount,
    isMember: group.hasMember(viewerId),
    isPending: group.hasPendingRequest(viewerId),
    isOwner,
    // Bekleyen istek sayısını sadece kurucu görür.
    ...(isOwner && { pendingCount: joinRequests.length }),
  };
};

// Keşfet: tüm gruplar, isim/açıklamada arama.
const searchGroups = asyncHandler(async (req, res) => {
  const match = wordSearchMatch(req.query.q, ['name', 'description']) || {};

  const data = await listGroups({
    match,
    sort: req.query.sort,
    ...parsePagination(req.query),
    viewerId: req.user?.id,
  });

  res.json({ success: true, data });
});

// Giriş yapan kullanıcının üyesi olduğu gruplar (kurduğu gruplar dahil).
const getMyGroups = asyncHandler(async (req, res) => {
  const data = await listGroups({
    match: { members: new mongoose.Types.ObjectId(req.user.id) },
    sort: 'newest',
    ...parsePagination(req.query),
    viewerId: req.user.id,
  });

  res.json({ success: true, data });
});

const getGroup = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  res.json({ success: true, data: { group: await toGroupDetail(group, req.user?.id) } });
});

// Grubu kuran kişi otomatik olarak kurucu ve ilk üye olur.
const createGroup = asyncHandler(async (req, res) => {
  const group = await Group.create({
    name: req.body.name,
    description: req.body.description,
    isPrivate: req.body.isPrivate,
    owner: req.user.id,
    members: [req.user.id],
  });

  res.status(201).json({
    success: true,
    message: 'Group created.',
    data: { group: await toGroupDetail(group, req.user.id) },
  });
});

const updateGroup = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  assertOwner(group, req.user.id);

  ['name', 'description', 'isPrivate'].forEach((field) => {
    if (req.body[field] !== undefined) group[field] = req.body[field];
  });
  // Grup herkese açık hale getirilirse bekleyen istekler otomatik onaylanır.
  if (!group.isPrivate && group.joinRequests.length) {
    group.members.addToSet(...group.joinRequests);
    group.joinRequests = [];
  }
  await group.save();

  res.json({ success: true, message: 'Group updated.', data: { group: await toGroupDetail(group, req.user.id) } });
});

// Grup silinince notlar silinmez, sadece grupla bağları kaldırılır. Sohbet mesajları silinir.
const deleteGroup = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  assertOwner(group, req.user.id);

  await group.deleteOne();
  await Promise.all([
    Note.updateMany({ group: group._id }, { $unset: { group: 1 } }),
    GroupMessage.deleteMany({ group: group._id }),
  ]);

  res.json({ success: true, message: 'Group deleted.' });
});

// Herkese açık gruba doğrudan katılınır; özel gruba katılma isteği gönderilir.
const joinGroup = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  const userId = req.user.id;

  if (!group.hasMember(userId)) {
    if (group.isPrivate) group.joinRequests.addToSet(userId);
    else group.members.addToSet(userId);
    await group.save();
    // Kurucuya: açık grupta yeni üye, özel grupta onay bekleyen istek bildirimi.
    await notify({
      recipient: group.owner,
      actor: userId,
      type: group.isPrivate ? 'group_request' : 'group_join',
      group: group._id,
    });
  }

  const isMember = group.hasMember(userId);
  res.json({
    success: true,
    message: isMember ? 'Joined the group.' : 'Join request sent. The founder will review it.',
    data: { isMember, isPending: group.hasPendingRequest(userId), membersCount: group.members.length },
  });
});

// Üye gruptan ayrılır; onay bekleyen kullanıcı ise isteğini geri çeker.
// Kurucu gruptan ayrılamaz: önce kuruculuğu devretmeli ya da grubu silmelidir.
const leaveGroup = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  const userId = req.user.id;

  if (group.hasPendingRequest(userId)) {
    group.joinRequests.pull(userId);
    await group.save();
    return res.json({
      success: true,
      message: 'Join request cancelled.',
      data: { isMember: false, isPending: false, membersCount: group.members.length },
    });
  }

  if (group.owner.equals(userId)) {
    throw new ApiError(400, 'The founder cannot leave the group. Transfer ownership or delete the group instead.');
  }

  group.members.pull(userId);
  await group.save();

  res.json({
    success: true,
    message: 'Left the group.',
    data: { isMember: false, isPending: false, membersCount: group.members.length },
  });
});

// Kurucu en üstte, diğer üyeler katılım sırasına göre.
const getMembers = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  assertCanView(group, req.user?.id);
  await group.populate('members', USER_CARD_FIELDS);

  const users = group.members
    .map((u) => ({ ...u.toObject(), isOwner: u._id.equals(group.owner) }))
    .sort((a, b) => Number(b.isOwner) - Number(a.isOwner));

  res.json({ success: true, data: { users } });
});

const removeMember = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  assertOwner(group, req.user.id);
  if (group.owner.equals(req.params.userId)) throw new ApiError(400, 'The founder cannot be removed.');
  if (!group.hasMember(req.params.userId)) throw new ApiError(404, 'User is not a member.');

  group.members.pull(req.params.userId);
  await group.save();

  res.json({ success: true, message: 'Member removed.', data: { membersCount: group.members.length } });
});

// Kuruculuk sadece mevcut bir üyeye devredilebilir.
const transferOwnership = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  assertOwner(group, req.user.id);
  if (!group.hasMember(req.params.userId)) {
    throw new ApiError(400, 'Ownership can only be transferred to a group member.');
  }

  group.owner = req.params.userId;
  await group.save();

  res.json({ success: true, message: 'Ownership transferred.', data: { group: await toGroupDetail(group, req.user.id) } });
});

// Özel grubun bekleyen katılma istekleri (sadece kurucu).
const getJoinRequests = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  assertOwner(group, req.user.id);
  await group.populate('joinRequests', USER_CARD_FIELDS);

  res.json({ success: true, data: { users: group.joinRequests } });
});

const approveJoinRequest = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  assertOwner(group, req.user.id);
  if (!group.hasPendingRequest(req.params.userId)) throw new ApiError(404, 'Join request not found.');

  group.joinRequests.pull(req.params.userId);
  group.members.addToSet(req.params.userId);
  await group.save();
  await notify({ recipient: req.params.userId, actor: req.user.id, type: 'group_approved', group: group._id });

  res.json({ success: true, message: 'Join request approved.', data: { membersCount: group.members.length } });
});

const rejectJoinRequest = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  assertOwner(group, req.user.id);
  if (!group.hasPendingRequest(req.params.userId)) throw new ApiError(404, 'Join request not found.');

  group.joinRequests.pull(req.params.userId);
  await group.save();

  res.json({ success: true, message: 'Join request rejected.' });
});

// Grup notları (herkese açık grupta da) sadece üyelere görünür.
const getGroupNotes = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  if (!group.hasMember(req.user?.id)) throw new ApiError(403, 'Only group members can see the notes shared in this group.');

  const data = await listNotes({
    match: { group: group._id },
    sort: req.query.sort,
    ...parsePagination(req.query),
    viewerId: req.user?.id,
    includeGroupNotes: true,
  });

  res.json({ success: true, data });
});

const MESSAGE_LIMIT = 100;

// Grup sohbeti: sadece üyeler. Son 100 mesaj eskiden yeniye sıralı döner (istemci periyodik olarak yeniler).
const getMessages = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  if (!group.hasMember(req.user.id)) throw new ApiError(403, 'Only group members can see the chat.');

  const messages = await GroupMessage.find({ group: group._id })
    .sort({ createdAt: -1 })
    .limit(MESSAGE_LIMIT)
    .populate('user', 'fullName avatarUrl');

  res.json({ success: true, data: { messages: messages.reverse() } });
});

const sendMessage = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  if (!group.hasMember(req.user.id)) throw new ApiError(403, 'Only group members can write in the chat.');

  const message = await GroupMessage.create({ group: group._id, user: req.user.id, text: req.body.text });
  await message.populate('user', 'fullName avatarUrl');

  res.status(201).json({ success: true, data: { message } });
});

// Mesajı yazan kişi veya grubun kurucusu silebilir.
const deleteMessage = asyncHandler(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  const message = await GroupMessage.findOne({ _id: req.params.messageId, group: group._id });
  if (!message) throw new ApiError(404, 'Message not found.');

  if (!message.user.equals(req.user.id) && !group.owner.equals(req.user.id)) {
    throw new ApiError(403, 'You are not allowed to delete this message.');
  }

  await message.deleteOne();
  res.json({ success: true, message: 'Message deleted.' });
});

module.exports = {
  searchGroups,
  getMyGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  getMembers,
  removeMember,
  transferOwnership,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getGroupNotes,
  getMessages,
  sendMessage,
  deleteMessage,
};
