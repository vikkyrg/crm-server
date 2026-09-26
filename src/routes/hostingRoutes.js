import express from 'express';
import { getHostings, getHosting, createHosting, updateHosting, deleteHosting } from '../controllers/hostingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Hosting', 'view'), getHostings)
  .post(protect, authorize('Hosting', 'create'), auditAction('Hosting', 'CREATE'), createHosting);

router.route('/:id')
  .get(protect, authorize('Hosting', 'view'), getHosting)
  .put(protect, authorize('Hosting', 'edit'), auditAction('Hosting', 'UPDATE'), updateHosting)
  .delete(protect, authorize('Hosting', 'delete'), auditAction('Hosting', 'DELETE'), deleteHosting);

export default router;
