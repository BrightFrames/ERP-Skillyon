import pool from '../db/index.js';

// GET /api/academic/teacher-classes
export const getTeacherClasses = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name FROM classes WHERE teacher_id = $1', [req.user.id]);
    // Fallback: If teacher has no assigned classes, just return all classes for demonstration
    if (rows.length === 0) {
      const all = await pool.query('SELECT id, name FROM classes');
      return res.status(200).json(all.rows);
    }
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/academic/classes/:classId/gradebook
export const getGradebook = async (req, res) => {
  const { classId } = req.params;
  try {
    const { rows: students } = await pool.query('SELECT id, name, avatar FROM students WHERE class_id = $1 ORDER BY name ASC', [classId]);
    const { rows: assessments } = await pool.query('SELECT id, name, type, max_score FROM assessments WHERE class_id = $1 ORDER BY id ASC', [classId]);
    const { rows: grades } = await pool.query(`
      SELECT g.student_id, g.assessment_id, g.score 
      FROM grades g 
      JOIN assessments a ON g.assessment_id = a.id 
      WHERE a.class_id = $1
    `, [classId]);
    
    res.status(200).json({ students, assessments, grades });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/academic/grades
export const updateGrade = async (req, res) => {
  const { assessment_id, student_id, score } = req.body;
  try {
    const { rows } = await pool.query(`
      INSERT INTO grades (assessment_id, student_id, score) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (assessment_id, student_id) 
      DO UPDATE SET score = EXCLUDED.score RETURNING *
    `, [assessment_id, student_id, score]);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/academic/classes/:classId/assessments
export const createAssessment = async (req, res) => {
  const { classId } = req.params;
  const { name, type, max_score } = req.body;
  try {
    const { rows } = await pool.query(`
      INSERT INTO assessments (class_id, teacher_id, name, type, max_score, date) 
      VALUES ($1, $2, $3, $4, $5, CURRENT_DATE) RETURNING *
    `, [classId, req.user.id, name, type || 'Quiz', max_score || 100]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
