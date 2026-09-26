import express from 'express';
import { getAMCs, getAMC, createAMC, updateAMC, deleteAMC } from '../controllers/amcController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('AMC', 'view'), getAMCs)
  .post(protect, authorize('AMC', 'create'), auditAction('AMC', 'CREATE'), createAMC);

router.route('/:id')
  .get(protect, authorize('AMC', 'view'), getAMC)
  .put(protect, authorize('AMC', 'edit'), auditAction('AMC', 'UPDATE'), updateAMC)
  .delete(protect, authorize('AMC', 'delete'), auditAction('AMC', 'DELETE'), deleteAMC);

export default router;
