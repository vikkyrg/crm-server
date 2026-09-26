import express from 'express';
import { getApprovals, getApproval, createApproval, updateApproval, deleteApproval } from '../controllers/approvalController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Approval', 'view'), getApprovals)
  .post(protect, authorize('Approval', 'create'), auditAction('Approval', 'CREATE'), createApproval);

router.route('/:id')
  .get(protect, authorize('Approval', 'view'), getApproval)
  .put(protect, authorize('Approval', 'edit'), auditAction('Approval', 'UPDATE'), updateApproval)
  .delete(protect, authorize('Approval', 'delete'), auditAction('Approval', 'DELETE'), deleteApproval);

export default router;
