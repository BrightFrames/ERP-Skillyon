import { Router } from 'express';
import { getTodayAttendance, getMonthlyAttendance, getFees, createPayment, getPaymentsHistory, quickPay, getAcademics, getMessages, sendMessage, getNotifications, markNotificationsRead } from '../controllers/parentController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Parent access only
router.get('/notifications', authenticate, requireRole(['PARENT']), getNotifications);
router.post('/notifications/read', authenticate, requireRole(['PARENT']), markNotificationsRead);
router.get('/:studentId/attendance/today', authenticate, requireRole(['PARENT']), getTodayAttendance);
router.get('/:studentId/attendance', authenticate, requireRole(['PARENT']), getMonthlyAttendance);
router.get('/:studentId/fees', authenticate, requireRole(['PARENT']), getFees);
router.post('/:studentId/pay', authenticate, requireRole(['PARENT']), createPayment);
router.post('/:studentId/quick-pay', authenticate, requireRole(['PARENT']), quickPay);
router.get('/:studentId/payments', authenticate, requireRole(['PARENT']), getPaymentsHistory);
router.get('/:studentId/academics', authenticate, requireRole(['PARENT']), getAcademics);
router.get('/:studentId/messages', authenticate, requireRole(['PARENT']), getMessages);
router.post('/:studentId/messages', authenticate, requireRole(['PARENT']), sendMessage);

export default router;

