import express from 'express';
import { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, getInvoicePrintHtml, sendInvoiceEmailHandler } from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Invoice', 'view'), getInvoices)
  .post(protect, authorize('Invoice', 'create'), auditAction('Invoice', 'CREATE'), createInvoice);

router.route('/:id/print-html')
  .get(getInvoicePrintHtml);

router.route('/:id/send-email')
  .post(protect, authorize('Invoice', 'edit'), sendInvoiceEmailHandler);

router.route('/:id')
  .get(protect, authorize('Invoice', 'view'), getInvoice)
  .put(protect, authorize('Invoice', 'edit'), auditAction('Invoice', 'UPDATE'), updateInvoice)
  .delete(protect, authorize('Invoice', 'delete'), auditAction('Invoice', 'DELETE'), deleteInvoice);

export default router;
