import express from 'express';
import { getDocuments, getDocument, createDocument, deleteDocument, downloadDocument } from '../controllers/documentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, getDocuments)
  .post(protect, authorize('Document', 'create'), auditAction('Document', 'CREATE'), createDocument);

router.route('/:id')
  .get(protect, getDocument)
  .delete(protect, authorize('Document', 'delete'), auditAction('Document', 'DELETE'), deleteDocument);

router.get('/:id/download', protect, downloadDocument);

export default router;
