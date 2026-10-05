const asyncHandler = require('../utils/asyncHandler');
const { User, Note, Group } = require('../models');
const { PUBLIC_NOTES_MATCH } = require('../services/note.service');

// Karşılama sayfasındaki topluluk sayaçları. Grup içi notlar herkese açık sayılmadığı için sayılmaz.
const getStats = asyncHandler(async (req, res) => {
  const [users, notes, groups, downloadAgg] = await Promise.all([
    User.estimatedDocumentCount(),
    Note.countDocuments(PUBLIC_NOTES_MATCH),
    Group.estimatedDocumentCount(),
    Note.aggregate([{ $group: { _id: null, total: { $sum: '$downloadsCount' } } }]),
  ]);

  res.json({
    success: true,
    data: { users, notes, groups, downloads: downloadAgg[0]?.total ?? 0 },
  });
});

module.exports = { getStats };
