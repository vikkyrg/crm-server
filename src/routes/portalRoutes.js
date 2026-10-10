import express from 'express';
import { getClientPortalData, getEmployeePortalData, recordEmployeeAttendance } from '../controllers/portalController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/client', protect, getClientPortalData);
router.get('/employee', protect, getEmployeePortalData);
router.post('/employee/attendance', protect, recordEmployeeAttendance);

export default router;
