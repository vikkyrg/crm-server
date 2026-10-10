import express from 'express';
import { getClients, getClient, getClient360, createClient, updateClient, deleteClient } from '../controllers/clientController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getClients)
  .post(protect, createClient);

router.get('/:id/360', protect, getClient360);

router.route('/:id')
  .get(protect, getClient)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

export default router;
