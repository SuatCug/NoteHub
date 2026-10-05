const { body, param } = require('express-validator');

const startConversationRules = [body('userId').isMongoId().withMessage('Invalid user id.')];

const sendMessageRules = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Message cannot be empty.')
    .isLength({ max: 2000 })
    .withMessage('Message can be at most 2000 characters.'),
  body('noteId').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid note id.'),
];

const messageParamRules = [param('messageId').isMongoId().withMessage('Invalid message id.')];

module.exports = { startConversationRules, sendMessageRules, messageParamRules };
