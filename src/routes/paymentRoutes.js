import express from 'express';
import { getPayments, getPayment, getPaymentReceipt, createPayment, updatePayment, deletePayment } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Payment', 'view'), getPayments)
  .post(protect, authorize('Payment', 'create'), auditAction('Payment', 'CREATE'), createPayment);

router.route('/:id/receipt')
  .get(protect, authorize('Payment', 'view'), getPaymentReceipt);

router.route('/:id')
  .get(protect, authorize('Payment', 'view'), getPayment)
  .put(protect, authorize('Payment', 'edit'), auditAction('Payment', 'UPDATE'), updatePayment)
  .delete(protect, authorize('Payment', 'delete'), auditAction('Payment', 'DELETE'), deletePayment);

export default router;
