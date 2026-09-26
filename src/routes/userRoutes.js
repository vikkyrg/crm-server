import express from 'express';
import { getUsers, createUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('User', 'view'), getUsers)
  .post(protect, authorize('User', 'create'), createUser);

export default router;
