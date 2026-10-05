const router = require('express').Router();
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { idParamRules } = require('../validations/common.validation');

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.post('/read-all', notificationController.markAllRead);
router.patch('/:id/read', idParamRules, validate, notificationController.markRead);

module.exports = router;
