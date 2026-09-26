import express from 'express';
import { getNotifications, getNotification, createNotification, updateNotification, deleteNotification } from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Notification', 'view'), getNotifications)
  .post(protect, authorize('Notification', 'create'), auditAction('Notification', 'CREATE'), createNotification);

router.route('/:id')
  .get(protect, authorize('Notification', 'view'), getNotification)
  .put(protect, authorize('Notification', 'edit'), auditAction('Notification', 'UPDATE'), updateNotification)
  .delete(protect, authorize('Notification', 'delete'), auditAction('Notification', 'DELETE'), deleteNotification);

export default router;
