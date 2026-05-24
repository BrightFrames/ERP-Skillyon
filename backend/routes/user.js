import express from 'express';
import { authenticate, requireRole, validateQuery, validatePaginationSchema } from '../middleware/auth.js';
import { getProfile, getActivities, login, parentLogin, parentSignup, studentLogin, getSettings, updateSettings } from '../controllers/userController.js';

const router = express.Router();

// @route   POST /api/user/login
// @access  Public
router.post('/login', login);
// Parent login route (email -> returns children and parent token)
router.post('/parent-login', parentLogin);
// Parent signup route (links child to parent)
router.post('/parent-signup', parentSignup);
// Student login route
router.post('/student-login', studentLogin);

// @route   GET /api/user/profile
// @access  Private (Admin, Teacher, Parent)
router.get('/profile', authenticate, getProfile);

// @route   GET /api/user/activities
// @access  Private (Teacher)
router.get(
  '/activities',
  authenticate,
  requireRole(['TEACHER', 'ADMIN']), // Fixed role case to match DB constraints
  validateQuery(validatePaginationSchema),
  getActivities
);

// @route   GET / PUT /api/user/settings
router.get('/settings', authenticate, getSettings);
router.put('/settings', authenticate, updateSettings);

export default router;
