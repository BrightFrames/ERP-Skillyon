import { Router } from 'express';
import pool from '../db/index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireRole(['ADMIN', 'STAFF']));

// GET /api/fees — list with stats
router.get('/', async (req, res) => {
  const { status, search } = req.query;
  try {
    let where = [];
    let params = [];
    let idx = 1;

    if (status) { where.push(`status = $${idx++}`); params.push(status); }
    if (search) { where.push(`(student_name ILIKE $${idx} OR class_name ILIKE $${idx})`); params.push(`%${search}%`); idx++; }

    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [txRes, statsRes] = await Promise.all([
      pool.query(`SELECT * FROM fee_transactions ${whereStr} ORDER BY id DESC`, params),
      pool.query(`SELECT
        COALESCE(SUM(amount) FILTER (WHERE status = 'Paid'), 0) AS collected,
        COALESCE(SUM(amount) FILTER (WHERE status = 'Pending'), 0) AS pending,
        COALESCE(SUM(amount) FILTER (WHERE status = 'Overdue'), 0) AS overdue,
        COUNT(*) FILTER (WHERE status = 'Paid') AS paid_count,
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'Overdue') AS overdue_count
      FROM fee_transactions`),
    ]);

    res.json({ data: txRes.rows, stats: statsRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/fees — create new invoice
router.post('/', async (req, res) => {
  const { student_id, student_name, class_name, amount, fee_type, status, due_date, notes } = req.body;
  if (!student_name || !amount) return res.status(400).json({ error: 'student_name and amount are required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO fee_transactions (student_id, student_name, class_name, amount, fee_type, status, due_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [student_id || null, student_name, class_name || null, amount, fee_type || 'Tuition', status || 'Pending', due_date || null, notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/fees/:id/status — update payment status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE fee_transactions SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
