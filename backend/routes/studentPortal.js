import { Router } from 'express';
import { getMyAttendanceToday, getMyAttendanceMonthly, getMyFees, getMyAcademics, getMyAssignments, submitAssignment } from '../controllers/studentPortalController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Student access only (uses req.user.id implicitly)
router.get('/attendance/today', authenticate, requireRole(['STUDENT']), getMyAttendanceToday);
router.get('/attendance', authenticate, requireRole(['STUDENT']), getMyAttendanceMonthly);
router.get('/assignments', authenticate, requireRole(['STUDENT']), getMyAssignments);
router.post('/assignments/:id/submit', authenticate, requireRole(['STUDENT']), submitAssignment);
router.get('/fees', authenticate, requireRole(['STUDENT']), getMyFees);
router.get('/academics', authenticate, requireRole(['STUDENT']), getMyAcademics);

export default router;