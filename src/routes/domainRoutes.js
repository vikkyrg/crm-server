import express from 'express';
import { getDomains, getDomain, createDomain, updateDomain, deleteDomain, renewDomain, getDomainRenewalHistory } from '../controllers/domainController.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditAction } from '../middleware/audit.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('Domain', 'view'), getDomains)
  .post(protect, authorize('Domain', 'create'), auditAction('Domain', 'CREATE'), createDomain);

router.route('/:id')
  .get(protect, authorize('Domain', 'view'), getDomain)
  .put(protect, authorize('Domain', 'edit'), auditAction('Domain', 'UPDATE'), updateDomain)
  .delete(protect, authorize('Domain', 'delete'), auditAction('Domain', 'DELETE'), deleteDomain);

router.route('/:id/renew')
  .post(protect, authorize('Domain', 'edit'), auditAction('Domain', 'RENEW'), renewDomain);

router.route('/:id/renewal-history')
  .get(protect, authorize('Domain', 'view'), getDomainRenewalHistory);

export default router;
