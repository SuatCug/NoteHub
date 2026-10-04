const router = require('express').Router();
const { blockUnverified } = require('../middlewares/auth.middleware');

// Herkese açık / doğrulama ekranının kullandığı endpoint'ler.
router.use('/auth', require('./auth.routes'));
router.use('/contact', require('./contact.routes'));
router.use('/stats', require('./stats.routes'));

// İçerik endpoint'leri: e-postasını doğrulamamış oturumlar erişemez (doğrulama şartı açıksa).
router.use(blockUnverified);
router.use('/users', require('./user.routes'));
router.use('/notes', require('./note.routes'));
router.use('/groups', require('./group.routes'));
router.use('/messages', require('./message.routes'));
router.use('/notifications', require('./notification.routes'));

module.exports = router;
