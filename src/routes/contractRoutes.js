import express from 'express';
import { getContracts, getContract, createContract, updateContract, deleteContract } from '../controllers/contractController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Contract', 'view'), getContracts)
  .post(protect, authorize('Contract', 'create'), auditAction('Contract', 'CREATE'), createContract);

router.route('/:id')
  .get(protect, authorize('Contract', 'view'), getContract)
  .put(protect, authorize('Contract', 'edit'), auditAction('Contract', 'UPDATE'), updateContract)
  .delete(protect, authorize('Contract', 'delete'), auditAction('Contract', 'DELETE'), deleteContract);

export default router;
