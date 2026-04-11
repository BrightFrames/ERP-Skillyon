import express from 'express';
import { authenticate, requireRole, validateQuery, validatePaginationSchema } from '../middleware/auth.js';
import { getProfile, getActivities } from '../controllers/userController.js';

const router = express.Router();

// @route   GET /api/user/profile
// @access  Private (Admin, Teacher, Parent)
router.get('/profile', authenticate, getProfile);

// @route   GET /api/user/activities
// @access  Private (Teacher)
router.get(
  '/activities',
  authenticate,
  requireRole(['Teacher', 'Admin']), // RBAC Enforcement
  validateQuery(validatePaginationSchema), // Zod payload sanitization
  getActivities
);

export default router;
