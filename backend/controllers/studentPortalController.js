import pool from '../db/index.js';

export const getMyAttendanceToday = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { rows } = await pool.query(
      `SELECT date, status FROM attendance WHERE student_id = $1 AND date = CURRENT_DATE`,
      [studentId]
    );
    res.json({ data: rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch today attendance' });
  }
};

export const getMyAttendanceMonthly = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const month = req.query.month || new Date().toISOString().slice(0,7);
    const start = month + '-01';
    const end = new Date(new Date(start).getFullYear(), new Date(start).getMonth()+1, 0).toISOString().slice(0,10);

    const { rows } = await pool.query(
      `SELECT date, status FROM attendance WHERE student_id = $1 AND date BETWEEN $2 AND $3 ORDER BY date ASC`,
      [studentId, start, end]
    );

    const total = rows.length;
    const present = rows.filter(r => r.status === 'PRESENT').length;
    const percent = total ? Math.round((present/total)*100) : 0;

    res.json({ data: rows, summary: { total, present, percent } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

export const getMyFees = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { rows } = await pool.query(
      `SELECT id, term, amount, status, due_date FROM fees WHERE student_id = $1 ORDER BY due_date ASC`,
      [studentId]
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fees' });
  }
};

export const getMyAcademics = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { rows } = await pool.query(
      `SELECT id, subject, exam_name, score, max_score FROM marks WHERE student_id = $1 ORDER BY exam_name DESC, subject ASC`,
      [studentId]
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch academics' });
  }
};