const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { Note, User } = require('../models');
const { listNotes, assertNoteVisible, PUBLIC_NOTES_MATCH } = require('../services/note.service');
const { assertMember } = require('../services/group.service');
const { saveNoteFile, readNoteFile, removeFile } = require('../services/storage.service');
const { parsePagination } = require('../utils/pagination.util');
const { containsRegex, exactRegex, splitSearchWords, wordSearchMatch } = require('../utils/regex.util');
const { NOTE_FILE_TYPES, getExtension, matchesSignature } = require('../utils/fileTypes.util');

const USER_CARD_FIELDS = 'fullName avatarUrl university department';
const EDITABLE_FIELDS = [
  'title',
  'description',
  'university',
  'department',
  'courseCode',
  'courseName',
  'instructorName',
  'semester',
];

const NOTE_SEARCH_FIELDS = [
  'title',
  'courseName',
  'courseCode',
  'instructorName',
  'description',
  'university',
  'department',
  'semester',
];

// Query parametrelerinden MongoDB filtre objesi üretir.
// q: kelime bazlı arama — her kelime not alanlarından birinde ya da yazarın adında geçmelidir.
const buildSearchMatch = async (query) => {
  const match = {};
  const str = (key) => (typeof query[key] === 'string' && query[key].trim() ? query[key] : null);

  if (str('university')) match.university = exactRegex(query.university);
  if (str('department')) match.department = exactRegex(query.department);
  if (str('courseCode')) match.courseCode = containsRegex(query.courseCode.replace(/\s+/g, ''));
  if (str('courseName')) match.courseName = containsRegex(query.courseName);
  if (str('instructorName')) match.instructorName = containsRegex(query.instructorName);
  if (str('semester')) match.semester = containsRegex(query.semester);
  if (str('fileType')) match.fileType = query.fileType;

  const words = splitSearchWords(query.q);
  if (!words.length) return match;

  // Her kelime için adı eşleşen yazarlar (örn. "elif" -> Elif'in notları).
  const authorIdsPerWord = await Promise.all(
    words.map((word) => User.find({ fullName: containsRegex(word) }).distinct('_id'))
  );
  const qMatch = wordSearchMatch(query.q, NOTE_SEARCH_FIELDS, (word, i) =>
    authorIdsPerWord[i].length ? [{ author: { $in: authorIdsPerWord[i] } }] : []
  );

  return { $and: [match, qMatch] };
};

// Not detay görünümü: beğeni dizisi yerine sayı + "ben beğendim mi" bilgisi döndürülür.
const toNoteDetail = (note, viewerId) => {
  // fileUrl depolama konumudur, istemciye gönderilmez.
  const { likes, fileUrl, __v, ...rest } = note.toObject();
  return {
    ...rest,
    likesCount: likes.length,
    commentsCount: rest.comments.length,
    isLiked: viewerId ? likes.some((id) => id.equals(viewerId)) : false,
    isOwner: viewerId ? Boolean(note.author?._id.equals(viewerId)) : false,
  };
};

const findNoteOrFail = async (id, select) => {
  const query = Note.findById(id);
  if (select) query.select(select);
  const note = await query;
  if (!note) throw new ApiError(404, 'Note not found.');
  return note;
};

const assertOwner = (note, userId) => {
  if (!note.author.equals(userId)) {
    throw new ApiError(403, 'You are not allowed to perform this action.');
  }
};

const searchNotes = asyncHandler(async (req, res) => {
  const data = await listNotes({
    match: await buildSearchMatch(req.query),
    sort: req.query.sort,
    ...parsePagination(req.query),
    viewerId: req.user?.id,
  });

  res.json({ success: true, data });
});

// Takip edilen kullanıcıların notlarından oluşan akış.
const getFeed = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user.id).select('following');

  const data = await listNotes({
    match: { author: { $in: me.following } },
    sort: 'newest',
    ...parsePagination(req.query),
    viewerId: req.user.id,
  });

  res.json({ success: true, data });
});

// Arama sayfasındaki filtre açılır listeleri için mevcut değerler.
const getFilterOptions = asyncHandler(async (req, res) => {
  // Filtre seçenekleri sadece genel (grupsuz) notlardan üretilir.
  const departmentFilter = {
    ...PUBLIC_NOTES_MATCH,
    ...(req.query.university && { university: exactRegex(String(req.query.university)) }),
  };

  const [universities, departments, semesters] = await Promise.all([
    Note.distinct('university', PUBLIC_NOTES_MATCH),
    Note.distinct('department', departmentFilter),
    Note.distinct('semester', PUBLIC_NOTES_MATCH),
  ]);

  const sortTr = (arr) => arr.filter(Boolean).sort((a, b) => a.localeCompare(b, 'tr'));

  res.json({
    success: true,
    data: {
      universities: sortTr(universities),
      departments: sortTr(departments),
      semesters: sortTr(semesters).reverse(),
      fileTypes: ['pdf', 'docx', 'image', 'archive'],
    },
  });
});

const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id)
    .populate('author', USER_CARD_FIELDS)
    .populate('comments.user', USER_CARD_FIELDS)
    .populate('group', 'name isPrivate');
  if (!note) throw new ApiError(404, 'Note not found.');
  await assertNoteVisible(note, req.user?.id);

  res.json({ success: true, data: { note: toNoteDetail(note, req.user?.id) } });
});

const createNote = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'A file is required (form field: file).');

  const ext = getExtension(req.file.originalname);
  if (!matchesSignature(req.file.buffer, ext)) {
    throw new ApiError(415, 'The file content does not match its extension.');
  }

  // Üniversite / bölüm gönderilmezse kullanıcının profilindeki değerler kullanılır.
  const author = await User.findById(req.user.id).select('university department');
  const fields = Object.fromEntries(EDITABLE_FIELDS.filter((f) => req.body[f] !== undefined).map((f) => [f, req.body[f]]));
  // Gruba paylaşım sadece o grubun üyelerine açık.
  if (req.body.group) await assertMember(req.body.group, req.user.id);

  const fileUrl = await saveNoteFile(req.file.buffer, ext);

  let note;
  try {
    note = await Note.create({
      university: author.university,
      department: author.department,
      ...fields,
      author: req.user.id,
      group: req.body.group || undefined,
      fileUrl,
      originalName: req.file.originalname,
      fileType: NOTE_FILE_TYPES[ext],
      fileSize: req.file.size,
    });
  } catch (error) {
    // Kayıt başarısız olursa diske yazılan dosya sahipsiz kalmasın.
    await removeFile(fileUrl);
    throw error;
  }

  await note.populate([
    { path: 'author', select: USER_CARD_FIELDS },
    { path: 'group', select: 'name isPrivate' },
  ]);

  res.status(201).json({
    success: true,
    message: 'Note uploaded.',
    data: { note: toNoteDetail(note, req.user.id) },
  });
});

const updateNote = asyncHandler(async (req, res) => {
  const note = await findNoteOrFail(req.params.id);
  assertOwner(note, req.user.id);

  EDITABLE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) note[field] = req.body[field];
  });
  await note.save();

  await note.populate([
    { path: 'author', select: USER_CARD_FIELDS },
    { path: 'comments.user', select: USER_CARD_FIELDS },
    { path: 'group', select: 'name isPrivate' },
  ]);

  res.json({ success: true, message: 'Note updated.', data: { note: toNoteDetail(note, req.user.id) } });
});

const deleteNote = asyncHandler(async (req, res) => {
  const note = await findNoteOrFail(req.params.id, '+fileUrl');
  assertOwner(note, req.user.id);

  await note.deleteOne();
  await removeFile(note.fileUrl);

  res.json({ success: true, message: 'Note deleted.' });
});

const readExistingFile = async (note) => {
  const buffer = await readNoteFile(note.fileUrl);
  if (!buffer) throw new ApiError(404, 'File not found.');
  return buffer;
};

// Sayfa içi önizleme (sadece PDF ve görseller). İndirme sayacını artırmaz.
const PREVIEW_CONTENT_TYPES = { '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };

const previewNote = asyncHandler(async (req, res) => {
  const note = await findNoteOrFail(req.params.id, '+fileUrl');
  await assertNoteVisible(note, req.user.id);
  const contentType = PREVIEW_CONTENT_TYPES[getExtension(note.fileUrl)];
  if (!contentType) throw new ApiError(415, 'Preview is not supported for this file type.');

  const buffer = await readExistingFile(note);
  res.set('Content-Type', contentType);
  res.set('Cache-Control', 'private, max-age=300');
  res.send(buffer);
});

// Kredi/puan sistemi yok: doğrulanmış her kullanıcı sınırsız indirebilir.
const downloadNote = asyncHandler(async (req, res) => {
  const note = await findNoteOrFail(req.params.id, '+fileUrl');
  await assertNoteVisible(note, req.user.id);
  const buffer = await readExistingFile(note);

  await Note.updateOne({ _id: note._id }, { $inc: { downloadsCount: 1 } });

  // Frontend'in Content-Disposition'daki dosya adını okuyabilmesi için.
  res.set('Access-Control-Expose-Headers', 'Content-Disposition');
  res.attachment(note.originalName);
  res.send(buffer);
});

const likeNote = asyncHandler(async (req, res) => {
  await assertNoteVisible(await findNoteOrFail(req.params.id, 'group author'), req.user.id);
  const note = await Note.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: new mongoose.Types.ObjectId(req.user.id) } },
    { returnDocument: 'after' }
  ).select('likes');
  if (!note) throw new ApiError(404, 'Note not found.');

  res.json({ success: true, data: { isLiked: true, likesCount: note.likes.length } });
});

const unlikeNote = asyncHandler(async (req, res) => {
  const note = await Note.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: new mongoose.Types.ObjectId(req.user.id) } },
    { returnDocument: 'after' }
  ).select('likes');
  if (!note) throw new ApiError(404, 'Note not found.');

  res.json({ success: true, data: { isLiked: false, likesCount: note.likes.length } });
});

module.exports = {
  searchNotes,
  getFeed,
  getFilterOptions,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  previewNote,
  downloadNote,
  likeNote,
  unlikeNote,
};
