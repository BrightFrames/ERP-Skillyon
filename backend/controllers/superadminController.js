import pool from '../db/index.js';
import bcrypt from 'bcrypt';

// GET /api/superadmin/me — Super admin profile + platform-wide stats
export const getSuperAdminProfile = async (req, res) => {
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
};

// GET /api/superadmin — List all schools with aggregate counts
export const getAllSchools = async (req, res) => {
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
};

// GET /api/superadmin/:id — Get single school details with its staff list and stats
export const getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolResult = await pool.query('SELECT * FROM schools WHERE id = $1', [id]);
    if (schoolResult.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    const staffResult = await pool.query(
      'SELECT id, name, email, role, subject, join_date FROM staff WHERE school_id = $1 ORDER BY role ASC, name ASC',
      [id]
    );

    const countsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM students WHERE school_id = $1) as student_count,
        (SELECT COUNT(*) FROM staff WHERE school_id = $1) as staff_count,
        (SELECT COUNT(*) FROM classes WHERE school_id = $1) as class_count
    `, [id]);

    const admin = staffResult.rows.find(s => s.role === 'ADMIN') || null;

    res.json({ 
      school: schoolResult.rows[0], 
      staff: staffResult.rows, 
      admin,
      stats: countsResult.rows[0] 
    });
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ error: 'Failed to fetch school details' });
  }
};

// POST /api/superadmin/:id/reset-admin-password — Reset password of a school admin
export const resetSchoolAdminPassword = async (req, res) => {
  const { id } = req.params;
  const { new_password, admin_id } = req.body;

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  try {
    let targetAdminId = admin_id;
    if (!targetAdminId) {
      const adminRes = await pool.query(
        "SELECT id FROM staff WHERE school_id = $1 AND role = 'ADMIN' LIMIT 1",
        [id]
      );
      if (adminRes.rows.length === 0) {
        return res.status(404).json({ error: 'No administrator found for this school' });
      }
      targetAdminId = adminRes.rows[0].id;
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query(
      'UPDATE staff SET password = $1 WHERE id = $2 AND school_id = $3',
      [hashedPassword, targetAdminId, id]
    );

    res.json({ message: 'Administrator password reset successfully' });
  } catch (error) {
    console.error('Reset admin password error:', error);
    res.status(500).json({ error: 'Failed to reset administrator password' });
  }
};

// GET /api/superadmin/users/all — Cross-tenant staff directory
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = `
      SELECT st.id, st.name, st.email, st.role, st.subject, st.join_date, st.school_id,
             s.name as school_name, s.subscription_status
      FROM staff st
      LEFT JOIN schools s ON st.school_id = s.id
      WHERE st.role != 'SUPER_ADMIN'
    `;
    const params = [];

    if (role && role !== 'ALL') {
      params.push(role);
      query += ` AND st.role = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (st.name ILIKE $${params.length} OR st.email ILIKE $${params.length} OR s.name ILIKE $${params.length})`;
    }

    query += ' ORDER BY st.join_date DESC, st.name ASC LIMIT 150';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch platform users' });
  }
};

// GET /api/superadmin/system/health — System diagnostics & live health metrics
export const getSystemHealth = async (req, res) => {
  const start = Date.now();
  try {
    const dbPing = await pool.query('SELECT NOW() as db_time, version()');
    const latencyMs = Date.now() - start;

    const memory = process.memoryUsage();
    const uptimeSec = Math.floor(process.uptime());

    res.json({
      status: 'HEALTHY',
      database: {
        status: 'CONNECTED',
        latency_ms: latencyMs,
        db_time: dbPing.rows[0].db_time,
        version: dbPing.rows[0].version?.split(' ')?.[0] || 'PostgreSQL',
        pool_total_connections: pool.totalCount || 0,
        pool_idle_connections: pool.idleCount || 0,
        pool_waiting_requests: pool.waitingCount || 0,
      },
      system: {
        uptime_seconds: uptimeSec,
        uptime_formatted: `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m ${uptimeSec % 60}s`,
        memory: {
          heap_used_mb: Math.round(memory.heapUsed / 1024 / 1024),
          heap_total_mb: Math.round(memory.heapTotal / 1024 / 1024),
          rss_mb: Math.round(memory.rss / 1024 / 1024),
        },
        node_version: process.version,
        platform: process.platform,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('System health check error:', error);
    res.status(500).json({
      status: 'DEGRADED',
      database: {
        status: 'ERROR',
        error: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
};

// GET /api/superadmin/subscriptions/overview — Subscriptions breakdown and renewals
export const getSubscriptionsOverview = async (req, res) => {
  try {
    const { rows: schools } = await pool.query(`
      SELECT id, name, subscription_status, subscription_expires_at, created_at,
        (SELECT COUNT(*) FROM students WHERE school_id = schools.id) as student_count,
        (SELECT COUNT(*) FROM staff WHERE school_id = schools.id) as staff_count
      FROM schools
      ORDER BY subscription_expires_at ASC NULLS LAST, created_at DESC
    `);

    const now = new Date();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const expiringSoon = schools.filter(s => {
      if (!s.subscription_expires_at) return false;
      const exp = new Date(s.subscription_expires_at);
      return exp > now && exp <= thirtyDaysFromNow;
    });

    const expired = schools.filter(s => {
      if (!s.subscription_expires_at) return false;
      return new Date(s.subscription_expires_at) <= now;
    });

    res.json({
      all: schools,
      expiringSoon,
      expired,
      counts: {
        total: schools.length,
        active: schools.filter(s => s.subscription_status === 'ACTIVE').length,
        trial: schools.filter(s => s.subscription_status === 'TRIAL').length,
        suspended: schools.filter(s => s.subscription_status === 'SUSPENDED').length,
        past_due: schools.filter(s => s.subscription_status === 'PAST_DUE').length,
      }
    });
  } catch (error) {
    console.error('Subscriptions overview error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription data' });
  }
};

// POST /api/superadmin — Create a new school + its admin (principal)
export const createSchool = async (req, res) => {
  const { school_name, admin_name, admin_email, admin_password } = req.body;

  if (!school_name || !admin_name || !admin_email || !admin_password) {
    return res.status(400).json({ error: 'All fields are required: school_name, admin_name, admin_email, admin_password' });
  }

  const client = await pool.connect();
  try {
    const existingUser = await client.query('SELECT id FROM staff WHERE email = $1', [admin_email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    const adminRole = 'ADMIN';

    await client.query('BEGIN');

    const schoolResult = await client.query(
      'INSERT INTO schools (name) VALUES ($1) RETURNING *',
      [school_name]
    );
    const school = schoolResult.rows[0];

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
};

// PUT /api/superadmin/:id/subscription — Update school subscription
export const updateSchoolSubscription = async (req, res) => {
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
};

// DELETE /api/superadmin/:id — Delete a school
export const deleteSchool = async (req, res) => {
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
};

