import pool from '../db/index.js';
import jwt from 'jsonwebtoken';

// Use a fallback secret for development if not in .env
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export const login = async (req, res, next) => {
  const { email } = req.body;
  try {
    // In a real app, verify passwords here (bcrypt.compare)
    // For this ERP, Admin provisions users, we'll authenticate via email for the prototype
    const { rows } = await pool.query('SELECT id, name, email, role, subject FROM staff WHERE email = ', [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    
    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getProfile = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // Secure Parameterized Query
    const { rows } = await pool.query(
      'SELECT id, name, email, role, subject, join_date FROM staff WHERE id = ', 
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('DB Query Error [getProfile]:', error);
    next(new Error('Failed to retrieve user profile'));
  }
};

export const getActivities = async (req, res, next) => {
  // Activity mock for now since we don't have an activities table yet
  const offset = parseInt(req.query.page || '0', 10) * parseInt(req.query.limit || '10', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  res.status(200).json({ data: [], totalCount: 0 });
};
