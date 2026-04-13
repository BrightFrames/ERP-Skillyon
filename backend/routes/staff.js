import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

// GET all staff (filtered by role if provided query param)
router.get('/', async (req, res) => {
  const { role } = req.query;
  try {
    let queryArgs = [];
    let queryText = 'SELECT * FROM staff ORDER BY join_date DESC';
    
    if (role) {
      queryText = 'SELECT * FROM staff WHERE role = $1 ORDER BY join_date DESC';
      queryArgs.push(role);
    } 
    
    const result = await pool.query(queryText, queryArgs);
    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// POST to create a new staff member (Teacher or Worker)
router.post('/', async (req, res) => {
  const { name, email, role, subject } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ success: false, error: 'Missing required fields: name, email, role.' });
  }

  try {
    const checkEmail = await pool.query('SELECT id FROM staff WHERE email = $1', [email]);
    if (checkEmail.rowCount > 0) {
      return res.status(409).json({ success: false, error: 'User with this email already exists.' });
    }

    const result = await pool.query(
      `INSERT INTO staff (name, email, role, subject, join_date)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)
       RETURNING *`,
      [name, email, role, subject || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

export default router;