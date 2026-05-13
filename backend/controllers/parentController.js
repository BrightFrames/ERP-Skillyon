import pool from '../db/index.js';

// In-memory payment receipts store (demo only)
const receipts = {};

export const getTodayAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { rows } = await pool.query(
      `SELECT date, status FROM attendance WHERE student_id = $1 AND date = CURRENT_DATE`,
      [studentId]
    );
    res.json({ data: rows[0] || null });
  } catch (err) {
    console.error('getTodayAttendance error', err);
    res.status(500).json({ error: 'Failed to fetch today attendance' });
  }
};

export const getMonthlyAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const month = req.query.month || new Date().toISOString().slice(0,7); // YYYY-MM
    const start = month + '-01';
    const end = new Date(new Date(start).getFullYear(), new Date(start).getMonth()+1, 0).toISOString().slice(0,10);

    const { rows } = await pool.query(
      `SELECT date, status FROM attendance WHERE student_id = $1 AND date BETWEEN $2 AND $3 ORDER BY date ASC`,
      [studentId, start, end]
    );

    // Calculate attendance %
    const total = rows.length;
    const present = rows.filter(r => r.status === 'PRESENT').length;
    const percent = total ? Math.round((present/total)*100) : 0;

    res.json({ data: rows, summary: { total, present, percent } });
  } catch (err) {
    console.error('getMonthlyAttendance error', err);
    res.status(500).json({ error: 'Failed to fetch monthly attendance' });
  }
};

export const getFees = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, term, amount, status, due_date FROM fees WHERE student_id = $1 ORDER BY due_date ASC`,
      [studentId]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getFees error', err);
    res.status(500).json({ error: 'Failed to fetch fees' });
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { term, amount, method } = req.body;

    // Mark fee as PAID for the term if found (demo simplification)
    const { rows } = await pool.query(
      `UPDATE fees SET status='PAID' WHERE student_id=$1 AND term=$2 RETURNING *`,
      [studentId, term]
    );

    const paymentId = `pay_${Date.now()}`;
    const receipt = {
      paymentId,
      studentId,
      term,
      amount,
      method: method || 'UPI_STUB',
      timestamp: new Date().toISOString()
    };

    receipts[paymentId] = receipt;

    res.json({ success: true, paymentId, receiptUrl: `/api/parent/${studentId}/payments/${paymentId}/receipt`, receipt });
  } catch (err) {
    console.error('createPayment error', err);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

export const getReceipt = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const receipt = receipts[paymentId];
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
    res.json({ receipt });
  } catch (err) {
    console.error('getReceipt error', err);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
};
