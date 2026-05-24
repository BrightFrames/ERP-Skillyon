import { Router } from 'express';
import { getMyAttendanceToday, getMyAttendanceMonthly, getMyFees, getMyAcademics } from '../controllers/studentPortalController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Student access only (uses req.user.id implicitly)
router.get('/attendance/today', authenticate, requireRole(['STUDENT']), getMyAttendanceToday);
router.get('/attendance', authenticate, requireRole(['STUDENT']), getMyAttendanceMonthly);
router.get('/fees', authenticate, requireRole(['STUDENT']), getMyFees);
router.get('/academics', authenticate, requireRole(['STUDENT']), getMyAcademics);

export default router;