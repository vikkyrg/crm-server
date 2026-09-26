import express from 'express';
import { getCustomFields, getCustomField, createCustomField, updateCustomField, deleteCustomField } from '../controllers/customfieldController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('CustomField', 'view'), getCustomFields)
  .post(protect, authorize('CustomField', 'create'), auditAction('CustomField', 'CREATE'), createCustomField);

router.route('/:id')
  .get(protect, authorize('CustomField', 'view'), getCustomField)
  .put(protect, authorize('CustomField', 'edit'), auditAction('CustomField', 'UPDATE'), updateCustomField)
  .delete(protect, authorize('CustomField', 'delete'), auditAction('CustomField', 'DELETE'), deleteCustomField);

export default router;
