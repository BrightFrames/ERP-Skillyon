import pool from '../db/index.js';
import jwt from 'jsonwebtoken';

// Use a fallback secret for development if not in .env
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

const DUMMY_USERS = {
  'admin@educore.edu': { id: 9991, name: 'System Admin', email: 'admin@educore.edu', role: 'ADMIN', subject: null, join_date: new Date().toISOString() },
  'teacher@educore.edu': { id: 9992, name: 'Sarah Jenkins', email: 'teacher@educore.edu', role: 'TEACHER', subject: 'Mathematics', join_date: new Date().toISOString() },
  'staff@educore.edu': { id: 9993, name: 'Marcus Thompson', email: 'staff@educore.edu', role: 'STAFF', subject: null, join_date: new Date().toISOString() },
};

export const login = async (req, res, next) => {
  const { email } = req.body;
  try {
    let user;

    // Check for dummy login
    if (DUMMY_USERS[email]) {
      user = DUMMY_USERS[email];
    } else {
      // In a real app, verify passwords here (bcrypt.compare)
      const { rows } = await pool.query('SELECT id, name, email, role, subject FROM staff WHERE email = $1', [email]);
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      user = rows[0];
    }
    
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

// Parent login: returns a token with role PARENT and the list of children
export const parentLogin = async (req, res, next) => {
  const { email } = req.body;
  try {
    // Find students with this parent email
    const { rows } = await pool.query('SELECT id, name, class_id FROM students WHERE parent_email = $1', [email]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'No children found for this parent email' });
    }

    const user = { id: email, name: email.split('@')[0], email, role: 'PARENT' };

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({ message: 'Login successful', token, user: { ...user, children: rows } });
  } catch (error) {
    console.error('Parent Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getProfile = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // If parent role, return parent profile with children
    if (req.user && req.user.role === 'PARENT') {
      const email = req.user.email || req.user.id;
      const { rows } = await pool.query('SELECT id, name, class_id FROM students WHERE parent_email = $1', [email]);
      const userObj = { id: email, name: (email || '').split('@')[0], role: 'PARENT', children: rows };
      return res.status(200).json(userObj);
    }

    // Check if it's a dummy user
    const dummyUser = Object.values(DUMMY_USERS).find(u => u.id === userId);
    if (dummyUser) {
      return res.status(200).json(dummyUser);
    }

    // Secure Parameterized Query
    const { rows } = await pool.query(
      'SELECT id, name, email, role, subject, join_date FROM staff WHERE id = $1', 
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
