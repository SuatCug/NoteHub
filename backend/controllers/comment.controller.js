const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { Note } = require('../models');
const { assertNoteVisible } = require('../services/note.service');

const USER_CARD_FIELDS = 'fullName avatarUrl university department';

const addComment = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id).select('comments group author');
  if (!note) throw new ApiError(404, 'Note not found.');
  await assertNoteVisible(note, req.user.id);

  note.comments.push({ user: req.user.id, text: req.body.text });
  await note.save();

  const comment = note.comments[note.comments.length - 1];
  await note.populate({ path: 'comments.user', select: USER_CARD_FIELDS });

  res.status(201).json({
    success: true,
    message: 'Comment added.',
    data: { comment: note.comments.id(comment._id), commentsCount: note.comments.length },
  });
});

// Yorumu sadece yorumun sahibi veya notun sahibi silebilir.
const deleteComment = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id).select('author comments');
  if (!note) throw new ApiError(404, 'Note not found.');

  const comment = note.comments.id(req.params.commentId);
  if (!comment) throw new ApiError(404, 'Comment not found.');

  if (!comment.user.equals(req.user.id) && !note.author.equals(req.user.id)) {
    throw new ApiError(403, 'You are not allowed to delete this comment.');
  }

  comment.deleteOne();
  await note.save();

  res.json({ success: true, message: 'Comment deleted.', data: { commentsCount: note.comments.length } });
});

module.exports = { addComment, deleteComment };
