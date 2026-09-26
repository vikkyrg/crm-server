import express from 'express';
import { getProjects, getProject, createProject, updateProject, deleteProject } from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Project', 'view'), getProjects)
  .post(protect, authorize('Project', 'create'), auditAction('Project', 'CREATE'), createProject);

router.route('/:id')
  .get(protect, authorize('Project', 'view'), getProject)
  .put(protect, authorize('Project', 'edit'), auditAction('Project', 'UPDATE'), updateProject)
  .delete(protect, authorize('Project', 'delete'), auditAction('Project', 'DELETE'), deleteProject);

export default router;
