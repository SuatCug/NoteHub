const { body, param } = require('express-validator');

// Grup oluşturma ve güncellemede ortak alanlar. Güncellemede tüm alanlar opsiyoneldir.
const groupFieldRules = (isUpdate) => {
  const required = (chain) => (isUpdate ? chain.optional() : chain);
  return [
    required(body('name'))
      .trim()
      .notEmpty()
      .withMessage('Group name is required.')
      .isLength({ max: 80 })
      .withMessage('Group name can be at most 80 characters.'),
    body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description can be at most 1000 characters.'),
    body('isPrivate').optional().isBoolean().withMessage('isPrivate must be true or false.').toBoolean(),
  ];
};

const createGroupRules = groupFieldRules(false);
const updateGroupRules = groupFieldRules(true);

const memberParamRules = [param('userId').isMongoId().withMessage('Invalid user id.')];

const messageRules = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Message cannot be empty.')
    .isLength({ max: 2000 })
    .withMessage('Message can be at most 2000 characters.'),
];

const messageParamRules = [param('messageId').isMongoId().withMessage('Invalid message id.')];

module.exports = { createGroupRules, updateGroupRules, memberParamRules, messageRules, messageParamRules };
