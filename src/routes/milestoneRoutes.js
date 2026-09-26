import express from 'express';
import { getMilestones, getMilestone, createMilestone, updateMilestone, deleteMilestone } from '../controllers/milestoneController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Milestone', 'view'), getMilestones)
  .post(protect, authorize('Milestone', 'create'), auditAction('Milestone', 'CREATE'), createMilestone);

router.route('/:id')
  .get(protect, authorize('Milestone', 'view'), getMilestone)
  .put(protect, authorize('Milestone', 'edit'), auditAction('Milestone', 'UPDATE'), updateMilestone)
  .delete(protect, authorize('Milestone', 'delete'), auditAction('Milestone', 'DELETE'), deleteMilestone);

export default router;
