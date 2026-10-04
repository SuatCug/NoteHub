const mongoose = require('mongoose');
const { Note, Group, User } = require('../models');
const ApiError = require('../utils/apiError');
const { buildPagination } = require('../utils/pagination.util');

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  popular: { likesCount: -1, createdAt: -1 },
  downloads: { downloadsCount: -1, createdAt: -1 },
};

// Not listelerinde (arama, akış, profil) ortak kullanılan kart görünümü.
// Beğeni/yorum dizilerinin tamamı yerine sadece sayıları döndürülür.
const cardProjection = (viewerId, savedIds = []) => ({
  title: 1,
  description: 1,
  university: 1,
  department: 1,
  courseCode: 1,
  courseName: 1,
  instructorName: 1,
  semester: 1,
  originalName: 1,
  fileType: 1,
  fileSize: 1,
  downloadsCount: 1,
  createdAt: 1,
  likesCount: 1,
  commentsCount: { $size: '$comments' },
  isLiked: viewerId ? { $in: [new mongoose.Types.ObjectId(viewerId), '$likes'] } : { $literal: false },
  isSaved: savedIds.length ? { $in: ['$_id', savedIds] } : { $literal: false },
  author: {
    _id: '$author._id',
    fullName: '$author.fullName',
    avatarUrl: '$author.avatarUrl',
    university: '$author.university',
    department: '$author.department',
  },
});

// Genel paylaşım ile grup paylaşımı ayrıdır: gruba paylaşılan notlar ana sayfa, akış, profil ve
// filtrelerde görünmez; sadece grup sayfasında, o grubun üyelerine listelenir.
// (Grup silinince notun group alanı kaldırılır ve not genel paylaşıma döner.)
const PUBLIC_NOTES_MATCH = { group: null };

// Tek bir notun izleyiciye görünür olup olmadığını kontrol eder; görünmüyorsa not yokmuş gibi 404 döner.
// Grup notlarını sadece grup üyeleri ve notun yazarı görebilir.
// note: group ve author alanları seçilmiş not dokümanı (group populate edilmiş de olabilir).
const assertNoteVisible = async (note, viewerId) => {
  const groupId = note.group?._id ?? note.group;
  if (!groupId) return;
  const authorId = note.author?._id ?? note.author;
  if (viewerId && authorId?.equals(viewerId)) return;

  const isMember = viewerId && (await Group.exists({ _id: groupId, members: viewerId }));
  if (!isMember) throw new ApiError(404, 'Note not found.');
};

// Filtre + sıralama + sayfalama ile not kartlarını ve toplam sayıyı döndürür.
// includeGroupNotes: grup sayfası için (üyelik kontrolü önceden yapılır); aksi halde sadece genel notlar listelenir.
const listNotes = async ({ match = {}, sort = 'newest', page, limit, skip, viewerId, includeGroupNotes = false }) => {
  const fullMatch = includeGroupNotes ? match : { $and: [match, PUBLIC_NOTES_MATCH] };
  // Kartlardaki yer imi durumu için izleyicinin kaydettiği notlar.
  const savedIds = viewerId ? ((await User.findById(viewerId).select('savedNotes').lean())?.savedNotes ?? []) : [];
  const [result] = await Note.aggregate([
    { $match: fullMatch },
    { $addFields: { likesCount: { $size: '$likes' } } },
    { $sort: SORT_OPTIONS[sort] || SORT_OPTIONS.newest },
    {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: limit },
          { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
          { $unwind: '$author' },
          { $project: cardProjection(viewerId, savedIds) },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const total = result.total[0]?.count || 0;
  return { items: result.items, pagination: buildPagination(page, limit, total) };
};

module.exports = { listNotes, assertNoteVisible, PUBLIC_NOTES_MATCH, SORT_OPTIONS };
