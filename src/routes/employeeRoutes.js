import express from 'express';
import { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Employee', 'view'), getEmployees)
  .post(protect, authorize('Employee', 'create'), auditAction('Employee', 'CREATE'), createEmployee);

router.route('/:id')
  .get(protect, authorize('Employee', 'view'), getEmployee)
  .put(protect, authorize('Employee', 'edit'), auditAction('Employee', 'UPDATE'), updateEmployee)
  .delete(protect, authorize('Employee', 'delete'), auditAction('Employee', 'DELETE'), deleteEmployee);

export default router;
