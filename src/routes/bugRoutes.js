import express from 'express';
import { getBugs, getBug, createBug, updateBug, deleteBug } from '../controllers/bugController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Bug', 'view'), getBugs)
  .post(protect, authorize('Bug', 'create'), auditAction('Bug', 'CREATE'), createBug);

router.route('/:id')
  .get(protect, authorize('Bug', 'view'), getBug)
  .put(protect, authorize('Bug', 'edit'), auditAction('Bug', 'UPDATE'), updateBug)
  .delete(protect, authorize('Bug', 'delete'), auditAction('Bug', 'DELETE'), deleteBug);

export default router;
