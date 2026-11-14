import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../middleware/auth.js';
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
router.use(authenticate, requireSchool, requireRole(['ADMIN', 'STAFF']));

router.get('/stats', getFeeStats);
router.get('/', getFees);
router.post('/', createFee);
router.get('/payments', getPayments);
router.get('/invoices', getInvoices);
router.get('/rules', getFineRules);
router.post('/rules', updateFineRules);
router.get('/types', getFeeTypes);

export default router;
