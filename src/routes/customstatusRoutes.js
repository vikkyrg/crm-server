import express from 'express';
import { getCustomStatuss, getCustomStatus, createCustomStatus, updateCustomStatus, deleteCustomStatus } from '../controllers/customstatusController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('CustomStatus', 'view'), getCustomStatuss)
  .post(protect, authorize('CustomStatus', 'create'), auditAction('CustomStatus', 'CREATE'), createCustomStatus);

router.route('/:id')
  .get(protect, authorize('CustomStatus', 'view'), getCustomStatus)
  .put(protect, authorize('CustomStatus', 'edit'), auditAction('CustomStatus', 'UPDATE'), updateCustomStatus)
  .delete(protect, authorize('CustomStatus', 'delete'), auditAction('CustomStatus', 'DELETE'), deleteCustomStatus);

export default router;
