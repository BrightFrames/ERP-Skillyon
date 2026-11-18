import { Router } from 'express';
import { authenticate, requireSchool, requirePermission } from '../middleware/auth.js';
import { createStudent, getStudents, deleteStudent, updateStudent } from '../controllers/studentController.js';

const router = Router();

router.use(authenticate, requireSchool);

// Retrieve all students - requires students:read permission
router.get('/', requirePermission('students:read'), getStudents);

// Create single student - requires students:create permission
router.post('/', requirePermission('students:create'), createStudent);

// Update single student - requires students:update permission
router.put('/:id', requirePermission('students:update'), updateStudent);

// Delete student - requires students:delete permission
router.delete('/:id', requirePermission('students:delete'), deleteStudent);

export default router;
