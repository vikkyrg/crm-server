import express from 'express';
import { getPayrolls, getPayroll, createPayroll, updatePayroll, deletePayroll } from '../controllers/payrollController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Payroll', 'view'), getPayrolls)
  .post(protect, authorize('Payroll', 'create'), auditAction('Payroll', 'CREATE'), createPayroll);

router.route('/:id')
  .get(protect, authorize('Payroll', 'view'), getPayroll)
  .put(protect, authorize('Payroll', 'edit'), auditAction('Payroll', 'UPDATE'), updatePayroll)
  .delete(protect, authorize('Payroll', 'delete'), auditAction('Payroll', 'DELETE'), deletePayroll);

export default router;
