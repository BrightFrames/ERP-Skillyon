import { Router } from 'express';
import { authenticate, requireRole, requireSchool } from '../middleware/auth.js';
import { getMessages, getStudentMessages, sendMessage } from '../controllers/messageController.js';

const router = Router();

router.use(authenticate, requireSchool, requireRole(['ADMIN', 'TEACHER', 'STAFF']));

router.get('/', getMessages);
router.get('/student/:studentId', getStudentMessages);
router.post('/send', sendMessage);

export default router;
