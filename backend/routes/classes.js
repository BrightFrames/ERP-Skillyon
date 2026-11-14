import { Router } from 'express';
import { authenticate, requireSchool } from '../middleware/auth.js';
import { getClasses, createClass } from '../controllers/classController.js';

const router = Router();

router.use(authenticate, requireSchool);

router.get('/', getClasses);
router.post('/', createClass);

export default router;
