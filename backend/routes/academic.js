import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../middleware/auth.js';
import { getTeacherClasses, getGradebook, updateGrade, createAssessment, getAssessmentSubmissions } from '../controllers/academicController.js';

const router = Router();

// Only TEACHERs (and ADMINs) can access academic gradebook routes
router.use(authenticate, requireSchool, requireRole(['TEACHER', 'ADMIN']));

router.get('/teacher-classes', getTeacherClasses);
router.get('/classes/:classId/gradebook', getGradebook);
router.put('/grades', updateGrade);
router.post('/classes/:classId/assessments', createAssessment);
router.get('/assessments/:assessmentId/submissions', getAssessmentSubmissions);

export default router;
