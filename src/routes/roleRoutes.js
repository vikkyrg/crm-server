import express from 'express';
import { getRoles, createRole } from '../controllers/roleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Role', 'view'), getRoles)
  .post(protect, authorize('Role', 'create'), createRole);

export default router;
