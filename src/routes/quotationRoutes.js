import express from 'express';
import { 
  getQuotations, 
  getQuotation, 
  createQuotation, 
  updateQuotation, 
  deleteQuotation, 
  submitForApproval,
  convertToInvoice,
  convertToProject 
} from '../controllers/quotationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getQuotations)
  .post(protect, createQuotation);

router.post('/:id/submit-approval', protect, submitForApproval);
router.post('/:id/convert-to-invoice', protect, convertToInvoice);
router.post('/:id/convert-to-project', protect, convertToProject);

router.route('/:id')
  .get(protect, getQuotation)
  .put(protect, updateQuotation)
  .delete(protect, deleteQuotation);

export default router;
