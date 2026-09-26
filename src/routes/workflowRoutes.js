import express from 'express';
import { getWorkflows, getWorkflow, createWorkflow, updateWorkflow, deleteWorkflow } from '../controllers/workflowController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Workflow', 'view'), getWorkflows)
  .post(protect, authorize('Workflow', 'create'), auditAction('Workflow', 'CREATE'), createWorkflow);

router.route('/:id')
  .get(protect, authorize('Workflow', 'view'), getWorkflow)
  .put(protect, authorize('Workflow', 'edit'), auditAction('Workflow', 'UPDATE'), updateWorkflow)
  .delete(protect, authorize('Workflow', 'delete'), auditAction('Workflow', 'DELETE'), deleteWorkflow);

export default router;
