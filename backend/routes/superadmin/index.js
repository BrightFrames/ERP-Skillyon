import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../../db/index.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// All routes require SUPER_ADMIN
router.use(authenticate, requireRole(['SUPER_ADMIN']));

// GET /me — Super admin profile + platform-wide stats
router.get('/me', async (req, res) => {
  try {
    const user = req.user;
    const statsResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM schools) as total_schools,
        (SELECT COUNT(*) FROM schools WHERE subscription_status = 'ACTIVE') as active_schools,
        (SELECT COUNT(*) FROM schools WHERE subscription_status = 'TRIAL') as trial_schools,
        (SELECT COUNT(*) FROM schools WHERE subscription_status = 'SUSPENDED') as suspended_schools,
        (SELECT COUNT(*) FROM staff WHERE role != 'SUPER_ADMIN') as total_staff,
        (SELECT COUNT(*) FROM students) as total_students
    `);
    res.json({ user, stats: statsResult.rows[0] });
  } catch (error) {
    console.error('Get superadmin profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET / — List all schools with aggregate counts
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM staff WHERE school_id = s.id) as staff_count,
        (SELECT COUNT(*) FROM students WHERE school_id = s.id) as student_count
      FROM schools s ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('List schools error:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// GET /:id — Get single school details with its staff list
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const schoolResult = await pool.query('SELECT * FROM schools WHERE id = $1', [id]);
    if (schoolResult.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    const staffResult = await pool.query(
      'SELECT id, name, email, role, subject, join_date FROM staff WHERE school_id = $1',
      [id]
    );

    res.json({ school: schoolResult.rows[0], staff: staffResult.rows });
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ error: 'Failed to fetch school details' });
  }
});

// POST / — Create a new school + its admin (principal)
// GUARD: Only creates ADMIN users, never SUPER_ADMIN
router.post('/', async (req, res) => {
  const { school_name, admin_name, admin_email, admin_password } = req.body;

  if (!school_name || !admin_name || !admin_email || !admin_password) {
    return res.status(400).json({ error: 'All fields are required: school_name, admin_name, admin_email, admin_password' });
  }

  const client = await pool.connect();
  try {
    // Check if admin email already exists
    const existingUser = await client.query('SELECT id FROM staff WHERE email = $1', [admin_email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    // GUARD: Ensure only one SUPER_ADMIN can ever exist
    // The admin_role for schools is always ADMIN (the school principal)
    const adminRole = 'ADMIN';

    await client.query('BEGIN');

    // Create school
    const schoolResult = await client.query(
      'INSERT INTO schools (name) VALUES ($1) RETURNING *',
      [school_name]
    );
    const school = schoolResult.rows[0];

    // Hash password and create admin user (always ADMIN, never SUPER_ADMIN)
    const hashedPassword = await bcrypt.hash(admin_password, 10);
    const adminResult = await client.query(
      'INSERT INTO staff (name, email, password, role, school_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, school_id',
      [admin_name, admin_email, hashedPassword, adminRole, school.id]
    );

    await client.query('COMMIT');

    res.status(201).json({ school, admin: adminResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create school error:', error);
    res.status(500).json({ error: 'Failed to create school' });
  } finally {
    client.release();
  }
});

// PUT /:id/subscription — Update school subscription
router.put('/:id/subscription', async (req, res) => {
  const { id } = req.params;
  const { subscription_status, subscription_expires_at } = req.body;

  try {
    const result = await pool.query(
      'UPDATE schools SET subscription_status = $1, subscription_expires_at = $2 WHERE id = $3 RETURNING *',
      [subscription_status, subscription_expires_at, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// DELETE /:id — Delete a school
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM schools WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('Delete school error:', error);
    res.status(500).json({ error: 'Failed to delete school' });
  }
});

export default router;
