import express from 'express';
import { getClients, getClient, createClient, updateClient, deleteClient } from '../controllers/clientController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Client', 'view'), getClients)
  .post(protect, authorize('Client', 'create'), auditAction('Client', 'CREATE'), createClient);

router.route('/:id')
  .get(protect, authorize('Client', 'view'), getClient)
  .put(protect, authorize('Client', 'edit'), auditAction('Client', 'UPDATE'), updateClient)
  .delete(protect, authorize('Client', 'delete'), auditAction('Client', 'DELETE'), deleteClient);

export default router;
