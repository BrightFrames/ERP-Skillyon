import { Router } from 'express';
import pool from '../db/index.js';
import { authenticate, requireRole, requireSchool } from '../middleware/auth.js';
import { checkAndApplyLateFees } from '../utils/feesHelper.js';

const router = Router();
router.use(authenticate, requireSchool, requireRole(['ADMIN', 'STAFF']));

// GET /api/fees/stats — dashboard widgets data
router.get('/stats', async (req, res) => {
  try {
    const schoolId = req.school_id;
    
    // Check and apply overdue transactions first
    await checkAndApplyLateFees();

    // Query stats
    const collectedRes = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total, COALESCE(SUM(fine_paid), 0) AS fine_collected FROM payments WHERE school_id = $1`,
      [schoolId]
    );

    const pendingRes = await pool.query(
      `SELECT COALESCE(SUM(remaining_amount), 0) AS total FROM fee_assignments WHERE status = 'Pending' AND school_id = $1`,
      [schoolId]
    );

    const overdueRes = await pool.query(
      `SELECT COALESCE(SUM(remaining_amount), 0) AS total FROM fee_assignments WHERE status = 'Overdue' AND school_id = $1`,
      [schoolId]
    );

    const monthlyRes = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total 
       FROM payments 
       WHERE school_id = $1 
         AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [schoolId]
    );

    res.json({
      collected: Number(collectedRes.rows[0].total),
      fineCollected: Number(collectedRes.rows[0].fine_collected),
      pending: Number(pendingRes.rows[0].total),
      overdue: Number(overdueRes.rows[0].total),
      monthlyRevenue: Number(monthlyRes.rows[0].total)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/fees — list fee assignments (with filters)
router.get('/', async (req, res) => {
  const { status, search, feeType, classId } = req.query;
  try {
    await checkAndApplyLateFees();

    let where = ['fa.school_id = $1'];
    let params = [req.school_id];
    let idx = 2;

    if (status) {
      where.push(`fa.status = $${idx++}`);
      params.push(status);
    }
    if (feeType) {
      where.push(`ft.name = $${idx++}`);
      params.push(feeType);
    }
    if (classId) {
      where.push(`s.class_id = $${idx++}`);
      params.push(parseInt(classId));
    }
    if (search) {
      where.push(`(s.name ILIKE $${idx} OR c.name ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const query = `
      SELECT fa.*, s.name AS student_name, c.name AS class_name, ft.name AS fee_type_name
      FROM fee_assignments fa
      LEFT JOIN students s ON fa.student_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN fee_types ft ON fa.fee_type_id = ft.id
      WHERE ${where.join(' AND ')}
      ORDER BY fa.id DESC
    `;

    const { rows } = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/fees/payments — payments history list
router.get('/payments', async (req, res) => {
  const { search, classId, dateStart, dateEnd } = req.query;
  try {
    let where = ['p.school_id = $1'];
    let params = [req.school_id];
    let idx = 2;

    if (classId) {
      where.push(`s.class_id = $${idx++}`);
      params.push(parseInt(classId));
    }
    if (search) {
      where.push(`s.name ILIKE $${idx++}`);
      params.push(`%${search}%`);
    }
    if (dateStart && dateEnd) {
      where.push(`p.payment_date BETWEEN $${idx++} AND $${idx++}`);
      params.push(dateStart);
      params.push(dateEnd);
    }

    const query = `
      SELECT p.*, s.name AS student_name, c.name AS class_name, ft.name AS fee_type_name
      FROM payments p
      LEFT JOIN students s ON p.student_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN fee_assignments fa ON p.fee_assignment_id = fa.id
      LEFT JOIN fee_types ft ON fa.fee_type_id = ft.id
      WHERE ${where.join(' AND ')}
      ORDER BY p.id DESC
    `;

    const { rows } = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// GET /api/fees/invoices — list of invoices
router.get('/invoices', async (req, res) => {
  const { search, status } = req.query;
  try {
    let where = ['i.school_id = $1'];
    let params = [req.school_id];
    let idx = 2;

    if (status) {
      where.push(`i.payment_status = $${idx++}`);
      params.push(status);
    }
    if (search) {
      where.push(`s.name ILIKE $${idx++}`);
      params.push(`%${search}%`);
    }

    const query = `
      SELECT i.*, s.name AS student_name, s.parent_email, c.name AS class_name, ft.name AS fee_type_name
      FROM invoices i
      LEFT JOIN students s ON i.student_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN fee_assignments fa ON i.fee_assignment_id = fa.id
      LEFT JOIN fee_types ft ON fa.fee_type_id = ft.id
      WHERE ${where.join(' AND ')}
      ORDER BY i.id DESC
    `;

    const { rows } = await pool.query(query, params);
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// GET /api/fees/rules — get fine rules configuration
router.get('/rules', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT rule_type, rule_value FROM fine_rules WHERE school_id = $1 LIMIT 1',
      [req.school_id]
    );
    res.json(rows[0] || { rule_type: 'FIXED', rule_value: 100.00 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load fine rules' });
  }
});

// POST /api/fees/rules — update fine rules configuration
router.post('/rules', async (req, res) => {
  const { rule_type, rule_value } = req.body;
  if (!rule_type || rule_value === undefined) {
    return res.status(400).json({ error: 'rule_type and rule_value are required' });
  }
  try {
    const schoolId = req.school_id;
    const { rows } = await pool.query(
      `INSERT INTO fine_rules (rule_type, rule_value, school_id) 
       VALUES ($1, $2, $3)
       ON CONFLICT (school_id) DO UPDATE 
       SET rule_type = EXCLUDED.rule_type, rule_value = EXCLUDED.rule_value
       RETURNING *`,
      [rule_type, parseFloat(rule_value), schoolId]
    );
    
    // If table constraint doesn't have unique index on school_id, do manual delete/insert
    // Let's check: in setup_fees_v2, we did not add UNIQUE(school_id). Let's do delete-then-insert.
    await pool.query('DELETE FROM fine_rules WHERE school_id = $1', [schoolId]);
    const insertRes = await pool.query(
      `INSERT INTO fine_rules (rule_type, rule_value, school_id) VALUES ($1, $2, $3) RETURNING *`,
      [rule_type, parseFloat(rule_value), schoolId]
    );

    res.json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save fine rules' });
  }
});

// POST /api/fees — create/assign new fee
router.post('/', async (req, res) => {
  const { student_id, fee_type_id, amount, due_date } = req.body;
  if (!student_id || !fee_type_id || !amount || !due_date) {
    return res.status(400).json({ error: 'student_id, fee_type_id, amount, and due_date are required' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO fee_assignments (student_id, fee_type_id, amount, remaining_amount, due_date, status, school_id)
       VALUES ($1, $2, $3, $3, $4, 'Pending', $5) RETURNING *`,
      [student_id, fee_type_id, parseFloat(amount), due_date, req.school_id]
    );

    // Look up parent email for notification
    const { rows: student } = await pool.query('SELECT parent_email, name FROM students WHERE id = $1', [student_id]);
    if (student[0] && student[0].parent_email) {
      await pool.query(
        `INSERT INTO notifications (recipient_email, title, message, school_id) 
         VALUES ($1, $2, $3, $4)`,
        [
          student[0].parent_email,
          'New Fee Assigned',
          `A new invoice for ₹${amount} has been assigned to your ward ${student[0].name}. Due date: ${due_date}.`,
          req.school_id
        ]
      );
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/fees/types — list fee types
router.get('/types', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, description FROM fee_types WHERE school_id = $1 ORDER BY name ASC', [req.school_id]);
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fee types' });
  }
});

export default router;
