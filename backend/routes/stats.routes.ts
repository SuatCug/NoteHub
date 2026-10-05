import { Router } from 'express';
import * as statsController from '../controllers/stats.controller.ts';

const router = Router();

// Genel platform sayaçları (anonim ziyaretçilere açık)
router.get('/', statsController.getStats);

export default router;
