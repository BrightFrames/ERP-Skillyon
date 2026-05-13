import { Router } from 'express';
import { getTodayAttendance, getMonthlyAttendance, getFees, createPayment, getReceipt } from '../controllers/parentController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Parent access only
router.get('/:studentId/attendance/today', authenticate, requireRole(['PARENT']), getTodayAttendance);
router.get('/:studentId/attendance', authenticate, requireRole(['PARENT']), getMonthlyAttendance);
router.get('/:studentId/fees', authenticate, requireRole(['PARENT']), getFees);
router.post('/:studentId/pay', authenticate, requireRole(['PARENT']), createPayment);
router.get('/:studentId/payments/:paymentId/receipt', authenticate, requireRole(['PARENT']), getReceipt);

export default router;
