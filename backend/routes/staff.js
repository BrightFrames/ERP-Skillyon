import express from 'express';
import pool from '../db/index.js';
import bcrypt from 'bcrypt';
import { authenticate, requireSchool } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireSchool);

// GET all staff (filtered by role if provided query param)
router.get('/', async (req, res) => {
  const { role } = req.query;
  try {
    let queryArgs = [];
    let queryText = 'SELECT id, name, email, role, subject, join_date FROM staff';
    let whereClauses = [];
    
    if (req.school_id) {
      whereClauses.push(`school_id = $${queryArgs.length + 1}`);
      queryArgs.push(req.school_id);
    }

    if (role) {
      whereClauses.push(`role = $${queryArgs.length + 1}`);
      queryArgs.push(role);
    } 

    if (whereClauses.length > 0) {
      queryText += ' WHERE ' + whereClauses.join(' AND ');
    }
    queryText += ' ORDER BY join_date DESC';
    
    const result = await pool.query(queryText, queryArgs);
    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// POST to create a new staff member (Teacher or Worker)
router.post('/', async (req, res) => {
  const { name, email, role, subject, password } = req.body;
  if (!name || !email || !role || !password) {
    return res.status(400).json({ success: false, error: 'Missing required fields: name, email, role, password.' });
  }

  try {
    const checkEmail = await pool.query('SELECT id FROM staff WHERE email = $1', [email]);
    if (checkEmail.rowCount > 0) {
      return res.status(409).json({ success: false, error: 'User with this email already exists.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO staff (name, email, role, subject, password, join_date, school_id)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6)
       RETURNING id, name, email, role, subject, join_date`,
      [name, email, role, subject || null, passwordHash, req.school_id || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// DELETE a staff member by ID (Admin only)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let queryText = 'DELETE FROM staff WHERE id = $1';
    let queryArgs = [id];
    if (req.school_id) {
      queryText += ' AND school_id = $2';
      queryArgs.push(req.school_id);
    }
    queryText += ' RETURNING id';
    
    const result = await pool.query(queryText, queryArgs);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Staff member not found' });
    }
    res.json({ success: true, message: 'Staff member deleted' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

export default router;