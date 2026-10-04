const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/notes', require('./note.routes'));
router.use('/groups', require('./group.routes'));
router.use('/contact', require('./contact.routes'));
router.use('/messages', require('./message.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/stats', require('./stats.routes'));

module.exports = router;
