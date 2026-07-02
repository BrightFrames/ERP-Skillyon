import { Router } from 'express';
import pool from '../db/index.js';
import { authenticate, requireRole, requireSchool } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireSchool, requireRole(['ADMIN', 'TEACHER', 'STAFF']));

// GET all parent messages
router.get('/', async (req, res) => {
  try {
    let query = `SELECT pm.id, pm.sender, pm.content, pm.timestamp, s.name as student_name, s.avatar, c.name as class_name FROM parent_messages pm JOIN students s ON pm.student_id = s.id LEFT JOIN classes c ON s.class_id = c.id`;
    let params = [];
    if (req.school_id) {
      query += ` WHERE s.school_id = $1`;
      params.push(req.school_id);
    }
    query += ` ORDER BY pm.timestamp DESC`;
    const { rows } = await pool.query(query, params);
    res.json({ data: rows });
  } catch (error) {
    console.error('get messages error', error);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;