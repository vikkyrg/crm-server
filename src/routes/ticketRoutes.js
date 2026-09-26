import express from 'express';
import { getTickets, getTicket, createTicket, updateTicket, deleteTicket } from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Ticket', 'view'), getTickets)
  .post(protect, authorize('Ticket', 'create'), auditAction('Ticket', 'CREATE'), createTicket);

router.route('/:id')
  .get(protect, authorize('Ticket', 'view'), getTicket)
  .put(protect, authorize('Ticket', 'edit'), auditAction('Ticket', 'UPDATE'), updateTicket)
  .delete(protect, authorize('Ticket', 'delete'), auditAction('Ticket', 'DELETE'), deleteTicket);

export default router;
