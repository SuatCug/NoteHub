const router = require('express').Router();
const messageController = require('../controllers/message.controller');
const authenticate = require('../middlewares/auth.middleware');
const requireVerified = require('../middlewares/verified.middleware');
const validate = require('../middlewares/validate.middleware');
const rateLimit = require('../middlewares/rateLimit.middleware');
const { idParamRules } = require('../validations/common.validation');
const { startConversationRules, sendMessageRules, messageParamRules } = require('../validations/message.validation');

// Spam'e karşı: kullanıcı başına dakikada en fazla 20 mesaj / 10 yeni konuşma.
const messageLimit = rateLimit({ windowMs: 60 * 1000, max: 20, message: 'You are sending messages too fast. Please wait a moment.' });
const startLimit = rateLimit({ windowMs: 60 * 1000, max: 10, message: 'Too many new conversations. Please wait a moment.' });

// Tüm mesaj endpoint'leri giriş gerektirir; yazmak için e-posta doğrulaması da gerekir.
router.use(authenticate);

router.get('/unread-count', messageController.getUnreadCount);
router.get('/conversations', messageController.getConversations);
router.post('/conversations', requireVerified, startLimit, startConversationRules, validate, messageController.startConversation);
router.get('/conversations/:id', idParamRules, validate, messageController.getConversation);
router.delete('/conversations/:id', idParamRules, validate, messageController.deleteConversation);

router.post(
  '/conversations/:id/messages',
  idParamRules,
  sendMessageRules,
  validate,
  requireVerified,
  messageLimit,
  messageController.sendMessage
);
router.delete(
  '/conversations/:id/messages/:messageId',
  idParamRules,
  messageParamRules,
  validate,
  messageController.deleteMessage
);

module.exports = router;
