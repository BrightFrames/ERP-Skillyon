import express from 'express';
import { authenticate, requireSchool, requirePermission } from '../middleware/auth.js';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../controllers/staffController.js';

const router = express.Router();

router.use(authenticate, requireSchool);

router.get('/', requirePermission('staff:read'), getStaff);
router.post('/', requirePermission('staff:create'), createStaff);
router.put('/:id', requirePermission('staff:update'), updateStaff);
router.delete('/:id', requirePermission('staff:delete'), deleteStaff);

export default router;
