import { Router } from 'express';
import { authenticate, requireSchool, requirePermission } from '../middleware/auth.js';
import { getMessages, getStudentMessages, sendMessage } from '../controllers/messageController.js';

const router = Router();

router.use(authenticate, requireSchool);

router.get('/', requirePermission('messages:read'), getMessages);
router.get('/student/:studentId', requirePermission('messages:read'), getStudentMessages);
router.post('/send', requirePermission('messages:send'), sendMessage);

export default router;
