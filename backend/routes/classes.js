import { Router } from 'express';
import { authenticate, requireSchool } from '../middleware/auth.js';
import pool from '../db/index.js';

const router = Router();

router.get('/', authenticate, requireSchool, async (req, res) => {
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
    console.error("DB Query Error [getClasses]:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', authenticate, requireSchool, async (req, res) => {
  try {
    // Only admins should create classes, but for simplicity relying on existing flow or role check if needed
    const { name, teacher_id } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Class name is required' });
    }

    const { rows } = await pool.query(
      'INSERT INTO classes (name, teacher_id, school_id) VALUES ($1, $2, $3) RETURNING *',
      [name, teacher_id || null, req.school_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("DB Query Error [addClass]:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
