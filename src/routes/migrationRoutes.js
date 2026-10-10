import express from 'express';
import { importLegacyWebsites } from '../controllers/migrationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/import-websites', protect, importLegacyWebsites);

export default router;
