const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { Notification } = require('../models');
const { parsePagination, buildPagination } = require('../utils/pagination.util');
const { emitToUsers } = require('../services/realtime.service');

const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { recipient: req.user.id };

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actor', 'fullName avatarUrl')
      .populate('note', 'title')
      .populate('group', 'name')
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, read: false }),
  ]);

  // Silinmiş kullanıcı / not / gruba ait bildirimler gösterilmez.
  const visible = items.filter(
    (n) => n.actor && (!['like', 'comment'].includes(n.type) || n.note) && (!n.type.startsWith('group') || n.group)
  );

  res.json({ success: true, data: { items: visible, unreadCount, pagination: buildPagination(page, limit, total) } });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.user.id, read: false });
  res.json({ success: true, data: { count } });
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user.id, read: false }, { $set: { read: true } });
  emitToUsers(req.user.id, 'notifications:changed');
  res.json({ success: true, data: { count: 0 } });
});

const markRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateOne({ _id: req.params.id, recipient: req.user.id }, { $set: { read: true } });
  if (!result.matchedCount) throw new ApiError(404, 'Notification not found.');
  if (result.modifiedCount) emitToUsers(req.user.id, 'notifications:changed');
  res.json({ success: true });
});

module.exports = { getNotifications, getUnreadCount, markAllRead, markRead };
