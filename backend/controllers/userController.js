import pool from '../db/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Use a fallback secret for development if not in .env
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';


export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    let user;

    // Real staff from DB — password check
    const { rows } = await pool.query('SELECT id, name, email, role, subject, password FROM staff WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    user = rows[0];

    if (!user.password || !password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT Token — include name so frontend always has it
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
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
        role: user.role,
        subject: user.subject || null,
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

export const parentSignup = async (req, res, next) => {
  const { parentEmail, studentId, studentEmail } = req.body;
  try {
    const check = await pool.query('SELECT id, parent_email FROM students WHERE id = $1 AND email = $2', [studentId, studentEmail]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found with matching ID and Email' });
    }
    
    await pool.query('UPDATE students SET parent_email = $1 WHERE id = $2', [parentEmail, studentId]);

    const { rows } = await pool.query('SELECT id, name, class_id FROM students WHERE parent_email = $1', [parentEmail]);
    const user = { id: parentEmail, name: parentEmail.split('@')[0], email: parentEmail, role: 'PARENT' };
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({ message: 'Signup and Link successful', token, user: { ...user, children: rows } });
  } catch (error) {
    console.error('Parent Signup Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const studentLogin = async (req, res, next) => {
  const { email } = req.body;
  try {
    const { rows } = await pool.query('SELECT id, name, email, class_id FROM students WHERE email = $1', [email]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Student not found with this email' });
    }
    const user = { ...rows[0], role: 'STUDENT' };
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error('Student Login Error:', error);
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

export const getSettings = async (req, res, next) => {
  try {
    const email = req.user.email;
    const { rows } = await pool.query('SELECT profile, notifications, appearance FROM user_settings WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(200).json({ profile: {}, notifications: {}, appearance: {} });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('getSettings error:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const email = req.user.email;
    const { profile, notifications, appearance } = req.body;
    
    // UPSERT basically logic
    const { rowCount } = await pool.query('SELECT 1 FROM user_settings WHERE email = $1', [email]);
    if (rowCount === 0) {
      await pool.query(
        'INSERT INTO user_settings (email, profile, notifications, appearance) VALUES ($1, $2, $3, $4)',
        [email, profile || {}, notifications || {}, appearance || {}]
      );
    } else {
      await pool.query(
        'UPDATE user_settings SET profile = $1, notifications = $2, appearance = $3 WHERE email = $4',
        [profile || {}, notifications || {}, appearance || {}, email]
      );
    }
    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('updateSettings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
