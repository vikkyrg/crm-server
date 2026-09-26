import express from 'express';
import { getLeaves, getLeave, createLeave, updateLeave, deleteLeave } from '../controllers/leaveController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Leave', 'view'), getLeaves)
  .post(protect, authorize('Leave', 'create'), auditAction('Leave', 'CREATE'), createLeave);

router.route('/:id')
  .get(protect, authorize('Leave', 'view'), getLeave)
  .put(protect, authorize('Leave', 'edit'), auditAction('Leave', 'UPDATE'), updateLeave)
  .delete(protect, authorize('Leave', 'delete'), auditAction('Leave', 'DELETE'), deleteLeave);

export default router;
