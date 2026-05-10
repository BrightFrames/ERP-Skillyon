import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createStudent, getStudents, deleteStudent, updateStudent } from '../controllers/studentController.js';

const router = Router();

// Retrieve all students - Accessible by Admin and Teacher roles
router.get('/', authenticate, requireRole(['ADMIN', 'TEACHER']), getStudents);

// Create single student - Accessible by Admin only
router.post('/', authenticate, requireRole(['ADMIN']), createStudent);

// Update single student - Accessible by Admin only
router.put('/:id', authenticate, requireRole(['ADMIN']), updateStudent);

// Delete student - Accessible by Admin only
router.delete('/:id', authenticate, requireRole(['ADMIN']), deleteStudent);

export default router;
