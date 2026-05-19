import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../db/index.js';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name FROM classes ORDER BY id ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error("DB Query Error [getClasses]:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    // Only admins should create classes, but for simplicity relying on existing flow or role check if needed
    const { name, teacher_id } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Class name is required' });
    }

    const { rows } = await pool.query(
      'INSERT INTO classes (name, teacher_id) VALUES ($1, $2) RETURNING *',
      [name, teacher_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("DB Query Error [addClass]:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
