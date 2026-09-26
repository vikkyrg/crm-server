import express from 'express';
import { getChangeRequests, getChangeRequest, createChangeRequest, updateChangeRequest, deleteChangeRequest } from '../controllers/changerequestController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('ChangeRequest', 'view'), getChangeRequests)
  .post(protect, authorize('ChangeRequest', 'create'), auditAction('ChangeRequest', 'CREATE'), createChangeRequest);

router.route('/:id')
  .get(protect, authorize('ChangeRequest', 'view'), getChangeRequest)
  .put(protect, authorize('ChangeRequest', 'edit'), auditAction('ChangeRequest', 'UPDATE'), updateChangeRequest)
  .delete(protect, authorize('ChangeRequest', 'delete'), auditAction('ChangeRequest', 'DELETE'), deleteChangeRequest);

export default router;
