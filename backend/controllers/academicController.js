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
    const { rows: assessments } = await pool.query(`
      SELECT 
        a.id, a.name, a.type, a.max_score, a.date, a.due_date, a.description, a.questions, a.attachment_name, a.attachment_data,
        COUNT(sub.id)::int AS submission_count
      FROM assessments a
      LEFT JOIN assignment_submissions sub ON sub.assessment_id = a.id
      WHERE a.class_id = $1 AND a.teacher_id = $2
      GROUP BY a.id
      ORDER BY a.id ASC
    `, [numericClassId, req.user.id]);
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
  const { name, type, max_score, due_date, description, questions, attachment_name, attachment_data } = req.body;
  try {
    const questionsJson = Array.isArray(questions) ? JSON.stringify(questions) : (questions ? JSON.stringify([questions]) : '[]');
    const { rows } = await pool.query(`
      INSERT INTO assessments (class_id, teacher_id, name, type, max_score, date, due_date, description, questions, attachment_name, attachment_data) 
      VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, $8, $9, $10) RETURNING *
    `, [
      classId, 
      req.user.id, 
      name, 
      type || 'Assignment', 
      parseInt(max_score) || 100,
      due_date || null,
      description || '',
      questionsJson,
      attachment_name || null,
      attachment_data || null
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/academic/assessments/:assessmentId/submissions
export const getAssessmentSubmissions = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const query = `
      SELECT sub.*, s.name as student_name, s.roll_no, s.email as student_email, g.score
      FROM assignment_submissions sub
      JOIN students s ON s.id = sub.student_id
      LEFT JOIN grades g ON g.assessment_id = sub.assessment_id AND g.student_id = sub.student_id
      WHERE sub.assessment_id = $1
      ORDER BY sub.submitted_at DESC
    `;
    const { rows } = await pool.query(query, [assessmentId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch assessment submissions' });
  }
};

// GET /api/academic/classes/:classId/attendance
export const getClassAttendance = async (req, res) => {
  const { classId } = req.params;
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const numericClassId = parseInt(classId, 10);

  try {
    const { rows } = await pool.query(`
      SELECT 
        s.id AS student_id,
        s.name AS student_name,
        s.father_name,
        s.email,
        s.avatar,
        a.id AS attendance_id,
        COALESCE(a.status, 'Present') AS status,
        a.remarks,
        $2::date AS date
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id AND a.date = $2
      WHERE s.class_id = $1 AND ($3::int IS NULL OR s.school_id = $3)
      ORDER BY s.name ASC
    `, [numericClassId, date, req.school_id || null]);

    const stats = {
      total: rows.length,
      present: rows.filter((r) => r.status === 'Present').length,
      absent: rows.filter((r) => r.status === 'Absent').length,
      late: rows.filter((r) => r.status === 'Late').length,
      excused: rows.filter((r) => r.status === 'Excused').length,
    };

    res.status(200).json({ date, class_id: numericClassId, students: rows, stats });
  } catch (error) {
    console.error('Error fetching class attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance data' });
  }
};

// POST /api/academic/classes/:classId/attendance
export const saveClassAttendance = async (req, res) => {
  const { classId } = req.params;
  const { date, records } = req.body;

  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty attendance records' });
  }

  const attendanceDate = date || new Date().toISOString().split('T')[0];
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const record of records) {
      const studentId = parseInt(record.student_id, 10);
      const status = record.status || 'Present';
      const remarks = record.remarks || '';

      await client.query(`
        INSERT INTO attendance (student_id, date, status, remarks)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (student_id, date)
        DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks
      `, [studentId, attendanceDate, status, remarks]);
    }

    await client.query('COMMIT');
    res.status(200).json({
      message: 'Attendance saved successfully',
      date: attendanceDate,
      saved_count: records.length,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving attendance:', error);
    res.status(500).json({ error: 'Failed to save attendance records' });
  } finally {
    client.release();
  }
};

// GET /api/academic/attendance/overview
export const getAttendanceOverview = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const { rows: todayRecords } = await pool.query(`
      SELECT 
        COUNT(s.id)::int as total_students,
        COUNT(a.id)::int as marked_students,
        COUNT(CASE WHEN a.status = 'Present' THEN 1 END)::int as present_count,
        COUNT(CASE WHEN a.status = 'Absent' THEN 1 END)::int as absent_count,
        COUNT(CASE WHEN a.status = 'Late' THEN 1 END)::int as late_count
      FROM students s
      LEFT JOIN attendance a ON s.id = a.student_id AND a.date = $1
      WHERE ($2::int IS NULL OR s.school_id = $2)
    `, [today, req.school_id || null]);

    const data = todayRecords[0] || {};
    const percent = data.total_students > 0 ? Math.round((data.present_count / data.total_students) * 100) : 0;

    res.status(200).json({
      date: today,
      ...data,
      attendance_percentage: percent,
    });
  } catch (error) {
    console.error('Error fetching attendance overview:', error);
    res.status(500).json({ error: 'Failed to fetch attendance overview' });
  }
};

// GET /api/academic/timetable
export const getTeacherTimetable = async (req, res) => {
  try {
    const { rows: classes } = await pool.query(
      'SELECT id, name FROM classes WHERE ($1::int IS NULL OR school_id = $1) ORDER BY id ASC',
      [req.school_id || null]
    );

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      { period: 1, start: '08:30 AM', end: '09:20 AM' },
      { period: 2, start: '09:25 AM', end: '10:15 AM' },
      { period: 3, start: '10:30 AM', end: '11:20 AM' },
      { period: 4, start: '11:25 AM', end: '12:15 PM' },
      { period: 5, start: '01:00 PM', end: '01:50 PM' },
      { period: 6, start: '01:55 PM', end: '02:45 PM' },
    ];

    const subject = req.user?.subject || 'Academics';
    const schedule = [];

    days.forEach((day, dayIndex) => {
      timeSlots.forEach((slot, slotIndex) => {
        // Rotate through available classes
        if (classes.length > 0) {
          const classItem = classes[(dayIndex + slotIndex) % classes.length];
          schedule.push({
            id: `${day}-${slot.period}`,
            day,
            period: slot.period,
            start_time: slot.start,
            end_time: slot.end,
            class_id: classItem.id,
            class_name: classItem.name,
            subject,
            room: `Room ${101 + ((classItem.id * 3) % 20)}`,
          });
        }
      });
    });

    res.status(200).json({ days, timeSlots, schedule });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
};

// GET /api/academic/analytics
export const getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Grades distribution
    const { rows: grades } = await pool.query(`
      SELECT g.score, a.max_score, a.name as assessment_name, c.name as class_name, s.name as student_name, s.id as student_id
      FROM grades g
      JOIN assessments a ON g.assessment_id = a.id
      JOIN classes c ON a.class_id = c.id
      JOIN students s ON g.student_id = s.id
      WHERE a.teacher_id = $1
    `, [teacherId]);

    let aCount = 0, bCount = 0, cCount = 0, dCount = 0, fCount = 0;
    const studentAverages = {};

    grades.forEach((g) => {
      const max = g.max_score || 100;
      const pct = (g.score / max) * 100;
      if (pct >= 90) aCount++;
      else if (pct >= 80) bCount++;
      else if (pct >= 70) cCount++;
      else if (pct >= 60) dCount++;
      else fCount++;

      if (!studentAverages[g.student_id]) {
        studentAverages[g.student_id] = { id: g.student_id, name: g.student_name, class_name: g.class_name, totalPct: 0, count: 0 };
      }
      studentAverages[g.student_id].totalPct += pct;
      studentAverages[g.student_id].count++;
    });

    const atRiskStudents = Object.values(studentAverages)
      .map((s) => ({
        id: s.id,
        name: s.name,
        class_name: s.class_name,
        average: Math.round(s.totalPct / s.count),
      }))
      .filter((s) => s.average < 65)
      .slice(0, 10);

    res.status(200).json({
      grade_distribution: {
        A: aCount,
        B: bCount,
        C: cCount,
        D: dCount,
        F: fCount,
      },
      total_graded: grades.length,
      at_risk_students: atRiskStudents,
    });
  } catch (error) {
    console.error('Error fetching teacher analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
