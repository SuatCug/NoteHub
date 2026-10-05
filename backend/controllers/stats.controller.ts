import asyncHandler from '../utils/asyncHandler.ts';
import { User, Note, Group } from '../models/index.ts';
import { PUBLIC_NOTES_MATCH } from '../services/note.service.ts';

// Karşılama sayfasındaki topluluk sayaçları. Grup içi notlar herkese açık sayılmadığı için sayılmaz.
const getStats = asyncHandler(async (_req, res) => {
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

export { getStats };
