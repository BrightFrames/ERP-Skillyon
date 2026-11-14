import express from 'express';
import { authenticate, requireSchool } from '../middleware/auth.js';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../controllers/staffController.js';

const router = express.Router();

router.use(authenticate, requireSchool);

router.get('/', getStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;
