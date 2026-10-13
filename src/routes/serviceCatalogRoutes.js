import express from 'express';
import { 
  getServiceCatalogs, 
  getServiceCatalog, 
  createServiceCatalog, 
  updateServiceCatalog, 
  deleteServiceCatalog 
} from '../controllers/serviceCatalogController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getServiceCatalogs)
  .post(authorize('Settings', 'create'), createServiceCatalog);

router.route('/:id')
  .get(getServiceCatalog)
  .put(authorize('Settings', 'edit'), updateServiceCatalog)
  .delete(authorize('Settings', 'delete'), deleteServiceCatalog);

export default router;
