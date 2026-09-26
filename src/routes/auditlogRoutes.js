import express from 'express';
import { getAuditLogs, createAuditLog } from '../controllers/auditlogController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.route('/').get(protect, getAuditLogs).post(protect, createAuditLog);
export default router;