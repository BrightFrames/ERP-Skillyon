import pool from '../db/index.js';
import { checkAndApplyLateFees } from '../utils/feesHelper.js';

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

    // Automatically transition due transactions & update late fee penalties
    await checkAndApplyLateFees();

    const { rows } = await pool.query(
      `SELECT 
        fa.id,
        ft.name AS term,
        fa.amount,
        UPPER(fa.status) AS status,
        fa.due_date
       FROM fee_assignments fa
       LEFT JOIN fee_types ft ON fa.fee_type_id = ft.id
       WHERE fa.student_id = $1 
       ORDER BY fa.due_date ASC`,
      [studentId]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getMyFees error:', err);
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

export const getMyAssignments = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    // Get student's class
    const studentRes = await pool.query('SELECT id, class_id FROM students WHERE id = $1', [studentId]);
    if (studentRes.rows.length === 0 || !studentRes.rows[0].class_id) {
      return res.json({ data: [], summary: { total: 0, pending: 0, completed: 0 } });
    }
    const classId = studentRes.rows[0].class_id;

    // Fetch all assessments/assignments for this class with teacher name, subject, and student's score & submission
    const { rows } = await pool.query(`
      SELECT 
        a.id,
        a.name,
        a.type,
        a.date,
        a.due_date,
        a.max_score,
        a.description,
        a.questions,
        a.attachment_name,
        a.attachment_data,
        c.name AS class_name,
        COALESCE(s.name, 'Teacher') AS teacher_name,
        COALESCE(s.subject, 'General') AS subject,
        g.score AS my_score,
        sub.id AS submission_id,
        sub.file_name AS submission_file_name,
        sub.file_data AS submission_file_data,
        sub.file_size AS submission_file_size,
        sub.notes AS submission_notes,
        sub.submitted_at,
        CASE 
          WHEN g.score IS NOT NULL THEN 'Graded'
          WHEN sub.id IS NOT NULL THEN 'Submitted'
          ELSE 'Pending'
        END AS status
      FROM assessments a
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN staff s ON a.teacher_id = s.id
      LEFT JOIN grades g ON g.assessment_id = a.id AND g.student_id = $1
      LEFT JOIN assignment_submissions sub ON sub.assessment_id = a.id AND sub.student_id = $1
      WHERE a.class_id = $2
      ORDER BY a.date DESC, a.id DESC
    `, [studentId, classId]);

    const total = rows.length;
    const completed = rows.filter(r => r.status === 'Graded').length;
    const submitted = rows.filter(r => r.status === 'Submitted').length;
    const pending = rows.filter(r => r.status === 'Pending').length;

    res.json({ data: rows, summary: { total, pending, submitted, completed } });
  } catch (err) {
    console.error('getMyAssignments error:', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

// POST /api/student-portal/assignments/:id/submit
export const submitAssignment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const assessmentId = req.params.id;
    const { file_name, file_data, file_size, notes } = req.body;

    if (!file_data && !notes) {
      return res.status(400).json({ error: 'Please upload a file or enter submission answers/notes.' });
    }

    const { rows } = await pool.query(`
      INSERT INTO assignment_submissions (assessment_id, student_id, file_name, file_data, file_size, notes, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (assessment_id, student_id) DO UPDATE
      SET file_name = EXCLUDED.file_name,
          file_data = EXCLUDED.file_data,
          file_size = EXCLUDED.file_size,
          notes = EXCLUDED.notes,
          submitted_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [assessmentId, studentId, file_name || null, file_data || null, file_size || null, notes || '']);

    res.json({ success: true, submission: rows[0] });
  } catch (err) {
    console.error('submitAssignment error:', err);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
};