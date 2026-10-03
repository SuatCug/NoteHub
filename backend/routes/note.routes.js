const router = require('express').Router();
const noteController = require('../controllers/note.controller');
const commentController = require('../controllers/comment.controller');
const authenticate = require('../middlewares/auth.middleware');
const { optionalAuth } = require('../middlewares/auth.middleware');
const requireVerified = require('../middlewares/verified.middleware');
const validate = require('../middlewares/validate.middleware');
const { uploadNoteFile } = require('../middlewares/upload.middleware');
const { idParamRules } = require('../validations/common.validation');
const {
  createNoteRules,
  updateNoteRules,
  listNotesRules,
  commentRules,
  commentParamRules,
} = require('../validations/note.validation');

const verifiedOnly = [authenticate, requireVerified];

// Arama & listeleme (anonim ziyaretçilere açık)
router.get('/', listNotesRules, validate, optionalAuth, noteController.searchNotes);
router.get('/filters', noteController.getFilterOptions);
router.get('/feed', authenticate, noteController.getFeed);
router.get('/:id', idParamRules, validate, optionalAuth, noteController.getNote);

// Not yükleme / düzenleme / silme (multipart/form-data, dosya alanı: "file")
router.post('/', verifiedOnly, uploadNoteFile, createNoteRules, validate, noteController.createNote);
router.patch('/:id', idParamRules, updateNoteRules, validate, verifiedOnly, noteController.updateNote);
router.delete('/:id', idParamRules, validate, authenticate, noteController.deleteNote);

// Önizleme ve indirme (giriş + doğrulama gerekli, kredi sınırı yok)
router.get('/:id/preview', idParamRules, validate, verifiedOnly, noteController.previewNote);
router.get('/:id/download', idParamRules, validate, verifiedOnly, noteController.downloadNote);

// Beğeni
router.post('/:id/like', idParamRules, validate, verifiedOnly, noteController.likeNote);
router.delete('/:id/like', idParamRules, validate, verifiedOnly, noteController.unlikeNote);

// Yorumlar
router.post('/:id/comments', idParamRules, commentRules, validate, verifiedOnly, commentController.addComment);
router.delete(
  '/:id/comments/:commentId',
  idParamRules,
  commentParamRules,
  validate,
  authenticate,
  commentController.deleteComment
);

module.exports = router;
