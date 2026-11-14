import express from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import {
  getSuperAdminProfile,
  getAllSchools,
  getSchoolById,
  createSchool,
  updateSchoolSubscription,
  resetSchoolAdminPassword,
  deleteSchool,
  getAllUsers,
  getSystemHealth,
  getSubscriptionsOverview,
} from '../../controllers/superadminController.js';

const router = express.Router();

// All routes require SUPER_ADMIN
router.use(authenticate, requireRole(['SUPER_ADMIN']));

// Profile & Multi-tenant stats
router.get('/me', getSuperAdminProfile);

// Cross-tenant directory
router.get('/users/all', getAllUsers);

// System health & diagnostics
router.get('/system/health', getSystemHealth);

// Subscriptions & renewals overview
router.get('/subscriptions/overview', getSubscriptionsOverview);

// Schools CRUD
router.get('/', getAllSchools);
router.post('/', createSchool);
router.get('/:id', getSchoolById);
router.put('/:id/subscription', updateSchoolSubscription);
router.post('/:id/reset-admin-password', resetSchoolAdminPassword);
router.delete('/:id', deleteSchool);

export default router;
