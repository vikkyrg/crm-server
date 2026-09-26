import express from 'express';
import { getQuotations, getQuotation, createQuotation, updateQuotation, deleteQuotation } from '../controllers/quotationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Quotation', 'view'), getQuotations)
  .post(protect, authorize('Quotation', 'create'), auditAction('Quotation', 'CREATE'), createQuotation);

router.route('/:id')
  .get(protect, authorize('Quotation', 'view'), getQuotation)
  .put(protect, authorize('Quotation', 'edit'), auditAction('Quotation', 'UPDATE'), updateQuotation)
  .delete(protect, authorize('Quotation', 'delete'), auditAction('Quotation', 'DELETE'), deleteQuotation);

export default router;
