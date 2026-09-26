import express from 'express';
import { getExpenses, getExpense, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Expense', 'view'), getExpenses)
  .post(protect, authorize('Expense', 'create'), auditAction('Expense', 'CREATE'), createExpense);

router.route('/:id')
  .get(protect, authorize('Expense', 'view'), getExpense)
  .put(protect, authorize('Expense', 'edit'), auditAction('Expense', 'UPDATE'), updateExpense)
  .delete(protect, authorize('Expense', 'delete'), auditAction('Expense', 'DELETE'), deleteExpense);

export default router;
