import { Router } from 'express';
import pool from '../db/index.js';
import { authenticate, requireRole, requireSchool } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireSchool, requireRole(['ADMIN', 'TEACHER', 'STAFF']));

// GET all parent messages
router.get('/', async (req, res) => {
  try {
    let query = `SELECT pm.id, pm.sender, pm.content, pm.timestamp, pm.student_id, s.name as student_name, s.avatar, s.parent_email, c.name as class_name FROM parent_messages pm JOIN students s ON pm.student_id = s.id LEFT JOIN classes c ON s.class_id = c.id`;
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

// GET messages for a specific student (conversation thread)
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, sender, content, timestamp FROM parent_messages WHERE student_id = $1 ORDER BY timestamp ASC`,
      [studentId]
    );
    res.json({ data: rows });
  } catch (error) {
    console.error('get student messages error', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST: Admin sends a message about a student
router.post('/send', async (req, res) => {
  try {
    const { student_id, content } = req.body;
    if (!student_id || !content) {
      return res.status(400).json({ error: 'student_id and content are required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO parent_messages (student_id, sender, content) VALUES ($1, 'ADMIN', $2) RETURNING *`,
      [student_id, content]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('send message error', error);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;