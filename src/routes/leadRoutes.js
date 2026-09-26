import express from 'express';
import { getLeads, getLead, createLead, updateLead, deleteLead } from '../controllers/leadController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Lead', 'view'), getLeads)
  .post(protect, authorize('Lead', 'create'), auditAction('Lead', 'CREATE'), createLead);

router.route('/:id')
  .get(protect, authorize('Lead', 'view'), getLead)
  .put(protect, authorize('Lead', 'edit'), auditAction('Lead', 'UPDATE'), updateLead)
  .delete(protect, authorize('Lead', 'delete'), auditAction('Lead', 'DELETE'), deleteLead);

export default router;
