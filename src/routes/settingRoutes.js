import express from 'express';
import { getSettings, getSetting, createSetting, updateSetting, deleteSetting } from '../controllers/settingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Setting', 'view'), getSettings)
  .post(protect, authorize('Setting', 'create'), auditAction('Setting', 'CREATE'), createSetting);

router.route('/:id')
  .get(protect, authorize('Setting', 'view'), getSetting)
  .put(protect, authorize('Setting', 'edit'), auditAction('Setting', 'UPDATE'), updateSetting)
  .delete(protect, authorize('Setting', 'delete'), auditAction('Setting', 'DELETE'), deleteSetting);

export default router;
