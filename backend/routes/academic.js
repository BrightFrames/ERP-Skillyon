import { Router } from 'express';
import { authenticate, requireSchool, requirePermission } from '../middleware/auth.js';
import {
  getTeacherClasses,
  getGradebook,
  updateGrade,
  createAssessment,
  getAssessmentSubmissions,
  getClassAttendance,
  saveClassAttendance,
  getAttendanceOverview,
  getTeacherTimetable,
  getTeacherAnalytics,
} from '../controllers/academicController.js';

const router = Router();

router.use(authenticate, requireSchool);

// Teacher classes and gradebooks
router.get('/teacher-classes', requirePermission('academics:read'), getTeacherClasses);
router.get('/classes/:classId/gradebook', requirePermission('academics:read'), getGradebook);
router.put('/grades', requirePermission('academics:grade'), updateGrade);

// Assessments & assignments
router.post('/classes/:classId/assessments', requirePermission('academics:create_assignment'), createAssessment);
router.get('/assessments/:assessmentId/submissions', requirePermission('academics:read'), getAssessmentSubmissions);

// Class attendance
router.get('/classes/:classId/attendance', requirePermission('academics:read'), getClassAttendance);
router.post('/classes/:classId/attendance', requirePermission('academics:grade'), saveClassAttendance);
router.get('/attendance/overview', requirePermission('academics:read'), getAttendanceOverview);

// Teacher timetable / routine schedule
router.get('/timetable', requirePermission('classes:read'), getTeacherTimetable);

// Academic analytics & student risk indicators
router.get('/analytics', requirePermission('academics:read'), getTeacherAnalytics);

export default router;
