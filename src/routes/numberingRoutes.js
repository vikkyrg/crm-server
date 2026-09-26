import express from 'express';
import { getNumberings, getNumbering, createNumbering, updateNumbering, deleteNumbering } from '../controllers/numberingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Numbering', 'view'), getNumberings)
  .post(protect, authorize('Numbering', 'create'), auditAction('Numbering', 'CREATE'), createNumbering);

router.route('/:id')
  .get(protect, authorize('Numbering', 'view'), getNumbering)
  .put(protect, authorize('Numbering', 'edit'), auditAction('Numbering', 'UPDATE'), updateNumbering)
  .delete(protect, authorize('Numbering', 'delete'), auditAction('Numbering', 'DELETE'), deleteNumbering);

export default router;
