import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.ts';
import authenticate from '../middlewares/auth.middleware.ts';
import validate from '../middlewares/validate.middleware.ts';
import { idParamRules } from '../validations/common.validation.ts';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.post('/read-all', notificationController.markAllRead);
router.patch('/:id/read', idParamRules, validate, notificationController.markRead);

export default router;
