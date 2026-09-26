import express from 'express';
import { getTimeEntrys, getTimeEntry, createTimeEntry, updateTimeEntry, deleteTimeEntry } from '../controllers/timeentryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('TimeEntry', 'view'), getTimeEntrys)
  .post(protect, authorize('TimeEntry', 'create'), auditAction('TimeEntry', 'CREATE'), createTimeEntry);

router.route('/:id')
  .get(protect, authorize('TimeEntry', 'view'), getTimeEntry)
  .put(protect, authorize('TimeEntry', 'edit'), auditAction('TimeEntry', 'UPDATE'), updateTimeEntry)
  .delete(protect, authorize('TimeEntry', 'delete'), auditAction('TimeEntry', 'DELETE'), deleteTimeEntry);

export default router;
