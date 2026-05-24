import { Router } from 'express';
import pool from '../db/index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireRole(['ADMIN', 'TEACHER', 'STAFF']));

// GET all parent messages
router.get('/', async (req, res) => {
  try {
    const query = `SELECT pm.id, pm.sender, pm.content, pm.timestamp, s.name as student_name, s.avatar, c.name as class_name FROM parent_messages pm JOIN students s ON pm.student_id = s.id LEFT JOIN classes c ON s.class_id = c.id ORDER BY pm.timestamp DESC`;
    const { rows } = await pool.query(query);
    res.json({ data: rows });
  } catch (error) {
    console.error('get messages error', error);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;