import express from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Task', 'view'), getTasks)
  .post(protect, authorize('Task', 'create'), auditAction('Task', 'CREATE'), createTask);

router.route('/:id')
  .get(protect, authorize('Task', 'view'), getTask)
  .put(protect, authorize('Task', 'edit'), auditAction('Task', 'UPDATE'), updateTask)
  .delete(protect, authorize('Task', 'delete'), auditAction('Task', 'DELETE'), deleteTask);

export default router;
