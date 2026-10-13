import express from 'express';
import { 
  getCreditNotes, 
  getCreditNote, 
  createCreditNote 
} from '../controllers/creditNoteController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCreditNotes)
  .post(authorize('Invoice', 'create'), createCreditNote);

router.route('/:id')
  .get(getCreditNote);

export default router;
