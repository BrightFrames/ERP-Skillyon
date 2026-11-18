import { Router } from 'express';
import { authenticate, requireSchool, requirePermission } from '../middleware/auth.js';
import { getClasses, createClass, updateClass, deleteClass } from '../controllers/classController.js';

const router = Router();

router.use(authenticate, requireSchool);

router.get('/', requirePermission('classes:read'), getClasses);
router.post('/', requirePermission('classes:create'), createClass);
router.put('/:id', requirePermission('classes:update'), updateClass);
router.delete('/:id', requirePermission('classes:delete'), deleteClass);

export default router;
