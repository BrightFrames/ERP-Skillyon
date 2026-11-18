import { Router } from 'express';
import { authenticate, requireSchool, requirePermission } from '../middleware/auth.js';
import {
  getFeeStats,
  getFees,
  getPayments,
  getInvoices,
  getFineRules,
  updateFineRules,
  createFee,
  getFeeTypes,
} from '../controllers/feesController.js';

const router = Router();
router.use(authenticate, requireSchool);

router.get('/stats', requirePermission('fees:read'), getFeeStats);
router.get('/', requirePermission('fees:read'), getFees);
router.post('/', requirePermission('fees:create'), createFee);
router.get('/payments', requirePermission('fees:read'), getPayments);
router.get('/invoices', requirePermission('fees:read'), getInvoices);
router.get('/rules', requirePermission('fees:read'), getFineRules);
router.post('/rules', requirePermission('fees:rules'), updateFineRules);
router.get('/types', requirePermission('fees:read'), getFeeTypes);

export default router;
