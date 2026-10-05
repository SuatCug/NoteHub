import { Router } from 'express';
import * as contactController from '../controllers/contact.controller.ts';
import { optionalAuth } from '../middlewares/auth.middleware.ts';
import validate from '../middlewares/validate.middleware.ts';
import { contactRules } from '../validations/contact.validation.ts';

const router = Router();

// İletişim formu (anonim ziyaretçilere de açık)
router.post('/', contactRules, validate, optionalAuth, contactController.sendContactMessage);

export default router;
