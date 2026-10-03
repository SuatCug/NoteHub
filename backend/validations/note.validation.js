const { body, param, query } = require('express-validator');
const { SORT_OPTIONS } = require('../services/note.service');

// Not oluşturma ve güncellemede ortak alanlar. Güncellemede tüm alanlar opsiyoneldir.
const noteFieldRules = (isUpdate) => {
  const required = (chain) => (isUpdate ? chain.optional() : chain);
  return [
    required(body('title')).trim().notEmpty().withMessage('Title is required.').isLength({ max: 150 }),
    required(body('courseName')).trim().notEmpty().withMessage('Course name is required.').isLength({ max: 150 }),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description can be at most 2000 characters.'),
    body('university').optional().trim().notEmpty().withMessage('University cannot be empty.').isLength({ max: 120 }),
    body('department').optional().trim().notEmpty().withMessage('Department cannot be empty.').isLength({ max: 120 }),
    body('courseCode').optional().trim().isLength({ max: 20 }).withMessage('Course code can be at most 20 characters.'),
    body('instructorName').optional().trim().isLength({ max: 100 }),
    body('semester').optional().trim().isLength({ max: 40 }),
  ];
};

// Not yüklerken opsiyonel olarak paylaşılacak grup (boş gönderilirse yok sayılır).
const createNoteRules = [
  ...noteFieldRules(false),
  body('group').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid group id.'),
];
const updateNoteRules = noteFieldRules(true);

const listNotesRules = [
  query('sort')
    .optional()
    .isIn(Object.keys(SORT_OPTIONS))
    .withMessage(`sort must be one of: ${Object.keys(SORT_OPTIONS).join(', ')}.`),
  query('fileType').optional().isIn(['pdf', 'docx', 'image', 'archive']).withMessage('Invalid file type filter.'),
];

const commentRules = [
  body('text').trim().notEmpty().withMessage('Comment cannot be empty.').isLength({ max: 1000 }).withMessage('Comment can be at most 1000 characters.'),
];

const commentParamRules = [param('commentId').isMongoId().withMessage('Invalid comment id.')];

module.exports = { createNoteRules, updateNoteRules, listNotesRules, commentRules, commentParamRules };
