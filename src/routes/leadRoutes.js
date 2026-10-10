import express from 'express';
import { getLeads, getLead, createLead, updateLead, deleteLead, convertLeadToClient, getLeadNotes, addLeadNote, updateLeadNote, deleteLeadNote } from '../controllers/leadController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getLeads)
  .post(protect, createLead);

router.post('/:id/convert', protect, convertLeadToClient);

router.route('/:id/notes')
  .get(protect, getLeadNotes)
  .post(protect, addLeadNote);

router.route('/:id/notes/:noteId')
  .put(protect, updateLeadNote)
  .delete(protect, deleteLeadNote);

router.route('/:id')
  .get(protect, getLead)
  .put(protect, updateLead)
  .delete(protect, deleteLead);

export default router;
