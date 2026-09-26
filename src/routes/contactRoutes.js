import express from 'express';
import { getContacts, getContact, createContact, updateContact, deleteContact } from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Contact', 'view'), getContacts)
  .post(protect, authorize('Contact', 'create'), auditAction('Contact', 'CREATE'), createContact);

router.route('/:id')
  .get(protect, authorize('Contact', 'view'), getContact)
  .put(protect, authorize('Contact', 'edit'), auditAction('Contact', 'UPDATE'), updateContact)
  .delete(protect, authorize('Contact', 'delete'), auditAction('Contact', 'DELETE'), deleteContact);

export default router;
