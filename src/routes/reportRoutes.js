import express from 'express';
import { getSalesReport, getFinanceReport, getOperationsReport, getHrReport } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/sales', protect, getSalesReport);
router.get('/finance', protect, getFinanceReport);
router.get('/operations', protect, getOperationsReport);
router.get('/hr', protect, getHrReport);

export default router;