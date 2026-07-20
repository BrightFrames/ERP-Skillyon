import pool from '../db/index.js';

// GET /api/academic/teacher-classes
export const getTeacherClasses = async (req, res) => {
  try {
    let whereClauses = [];
    let params = [];

    if (req.school_id) {
      whereClauses.push(`school_id = $${params.length + 1}`);
      params.push(req.school_id);
    }

    if (req.user && String(req.user.role).toUpperCase() === 'TEACHER') {
      const teacherRes = await pool.query(
        'SELECT is_class_teacher, class_teacher_of, assigned_classes FROM staff WHERE id = $1',
        [req.user.id]
      );
      if (teacherRes.rows.length === 0) {
        return res.status(200).json([]);
      }
      const teacher = teacherRes.rows[0];
      const permittedClassIds = new Set();
      if (teacher.is_class_teacher && teacher.class_teacher_of) {
        permittedClassIds.add(parseInt(teacher.class_teacher_of, 10));
      }
      let rawAssigned = teacher.assigned_classes;
      if (typeof rawAssigned === 'string') {
        try { rawAssigned = JSON.parse(rawAssigned); } catch { rawAssigned = []; }
      }
      if (Array.isArray(rawAssigned)) {
        rawAssigned.forEach(cid => {
          const parsed = parseInt(cid, 10);
          if (!isNaN(parsed)) permittedClassIds.add(parsed);
        });
      }

      const allowedArray = Array.from(permittedClassIds);
      if (allowedArray.length === 0) {
        return res.status(200).json([]);
      }

      whereClauses.push(`id = ANY($${params.length + 1}::int[])`);
      params.push(allowedArray);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ` + whereClauses.join(' AND ') : '';
    const query = `SELECT id, name FROM classes ${whereStr} ORDER BY id ASC`;
    const { rows } = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/academic/classes/:classId/gradebook
export const getGradebook = async (req, res) => {
  const { classId } = req.params;
  const numericClassId = parseInt(classId, 10);

  try {
    // Check permission if teacher
    if (req.user && req.user.role === 'TEACHER') {
      const teacherRes = await pool.query(
        'SELECT is_class_teacher, class_teacher_of, assigned_classes FROM staff WHERE id = $1',
        [req.user.id]
      );
      if (teacherRes.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied: Class not assigned to teacher' });
      }
      const teacher = teacherRes.rows[0];
      const permittedClassIds = new Set();
      if (teacher.is_class_teacher && teacher.class_teacher_of) {
        permittedClassIds.add(parseInt(teacher.class_teacher_of, 10));
      }
      let rawAssigned = teacher.assigned_classes;
      if (typeof rawAssigned === 'string') {
        try { rawAssigned = JSON.parse(rawAssigned); } catch { rawAssigned = []; }
      }
      if (Array.isArray(rawAssigned)) {
        rawAssigned.forEach(cid => {
          const parsed = parseInt(cid, 10);
          if (!isNaN(parsed)) permittedClassIds.add(parsed);
        });
      }

      if (!permittedClassIds.has(numericClassId)) {
        return res.status(403).json({ error: 'Access denied: Class not assigned to teacher' });
      }
    }

    const { rows: students } = await pool.query('SELECT id, name, avatar FROM students WHERE class_id = $1 ORDER BY name ASC', [numericClassId]);
    const { rows: assessments } = await pool.query('SELECT id, name, type, max_score FROM assessments WHERE class_id = $1 AND teacher_id = $2 ORDER BY id ASC', [numericClassId, req.user.id]);
    const { rows: grades } = await pool.query(`
      SELECT g.student_id, g.assessment_id, g.score 
      FROM grades g 
      JOIN assessments a ON g.assessment_id = a.id 
      WHERE a.class_id = $1 AND a.teacher_id = $2
    `, [numericClassId, req.user.id]);
    
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
