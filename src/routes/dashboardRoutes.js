import express from 'express';
import { getManagementMetrics, getCeoMorningView, getActionCenterItems } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/metrics', protect, getManagementMetrics);
router.get('/ceo-view', protect, getCeoMorningView);
router.get('/action-center', protect, getActionCenterItems);

export default router;
