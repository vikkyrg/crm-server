import express from 'express';
import { getFollowUps, getFollowUp, createFollowUp, updateFollowUp, deleteFollowUp } from '../controllers/followupController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('FollowUp', 'view'), getFollowUps)
  .post(protect, authorize('FollowUp', 'create'), auditAction('FollowUp', 'CREATE'), createFollowUp);

router.route('/:id')
  .get(protect, authorize('FollowUp', 'view'), getFollowUp)
  .put(protect, authorize('FollowUp', 'edit'), auditAction('FollowUp', 'UPDATE'), updateFollowUp)
  .delete(protect, authorize('FollowUp', 'delete'), auditAction('FollowUp', 'DELETE'), deleteFollowUp);

export default router;
