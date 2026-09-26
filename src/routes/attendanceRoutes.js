import express from 'express';
import { getAttendances, getAttendance, createAttendance, updateAttendance, deleteAttendance } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Attendance', 'view'), getAttendances)
  .post(protect, authorize('Attendance', 'create'), auditAction('Attendance', 'CREATE'), createAttendance);

router.route('/:id')
  .get(protect, authorize('Attendance', 'view'), getAttendance)
  .put(protect, authorize('Attendance', 'edit'), auditAction('Attendance', 'UPDATE'), updateAttendance)
  .delete(protect, authorize('Attendance', 'delete'), auditAction('Attendance', 'DELETE'), deleteAttendance);

export default router;
