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

export default router;
