import express from 'express';
import { getWebsites, getWebsite, createWebsite, updateWebsite, deleteWebsite } from '../controllers/websiteController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Website', 'view'), getWebsites)
  .post(protect, authorize('Website', 'create'), auditAction('Website', 'CREATE'), createWebsite);

router.route('/:id')
  .get(protect, authorize('Website', 'view'), getWebsite)
  .put(protect, authorize('Website', 'edit'), auditAction('Website', 'UPDATE'), updateWebsite)
  .delete(protect, authorize('Website', 'delete'), auditAction('Website', 'DELETE'), deleteWebsite);

export default router;
