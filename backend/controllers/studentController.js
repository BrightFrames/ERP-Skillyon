import pool from '../db/index.js';
import { z } from 'zod';
import bcrypt from 'bcrypt';

// Zod schemas for validation
const studentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  parent_email: z.string().email().optional().nullable(),
  class_id: z.number().int().positive().optional().nullable(),
  gender: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  password: z.string().min(6).optional().nullable(),
  parent_password: z.string().min(6).optional().nullable()
});

// Admin ONLY: Create Student
export const createStudent = async (req, res, next) => {
  try {
    const validatedData = studentSchema.parse(req.body);
    
    let hashedPassword = null;
    let hashedParentPassword = null;
    
    if (validatedData.password) {
      hashedPassword = await bcrypt.hash(validatedData.password, 10);
    }
    if (validatedData.parent_password) {
      hashedParentPassword = await bcrypt.hash(validatedData.parent_password, 10);
    }
    
    const { rows } = await pool.query(
      `INSERT INTO students (name, email, parent_email, class_id, gender, status, avatar, password, parent_password, school_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        validatedData.name, 
        validatedData.email, 
        validatedData.parent_email, 
        validatedData.class_id,
        validatedData.gender || 'Unknown',
        validatedData.status || 'Active',
        validatedData.avatar || null,
        hashedPassword,
        hashedParentPassword,
        req.school_id
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    console.error("DB Query Error [createStudent]:", error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create student' });
  }
};

// Admin & Teacher: Get Students
export const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '0', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';
    const classId = req.query.class_id || '';
    const status = req.query.status || '';
    const offset = page * limit;

    let whereClauses = [];
    let params = [];
    let paramIndex = 1;

    if (req.school_id) {
      whereClauses.push(`s.school_id = $${paramIndex}`);
      params.push(req.school_id);
      paramIndex++;
    }

    if (search) {
      whereClauses.push(`(s.name ILIKE $${paramIndex} OR s.email ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (classId) {
      whereClauses.push(`s.class_id = $${paramIndex}`);
      params.push(classId);
      paramIndex++;
    }

    if (status) {
      whereClauses.push(`s.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ` + whereClauses.join(' AND ') : '';

    let metricsQueryStr = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN s.gender = 'Male' THEN 1 ELSE 0 END) as male_count,
        SUM(CASE WHEN s.gender = 'Female' THEN 1 ELSE 0 END) as female_count,
        SUM(CASE WHEN s.enrollment_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 ELSE 0 END) as new_enrollments
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      ${whereStr}
    `;

    const metricsResult = await pool.query(metricsQueryStr, params);
    const metrics = metricsResult.rows[0] || {};
    const total = parseInt(metrics.total || 0, 10);

    const rowsQueryStr = `
      SELECT s.id, s.name, s.email, s.parent_email, c.name as class_name, s.enrollment_date, s.gender, s.status, s.avatar 
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      ${whereStr}
      ORDER BY s.id ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const rowsParams = [...params, limit, offset];

    const { rows } = await pool.query(rowsQueryStr, rowsParams);

    res.status(200).json({
      data: rows,
      total,
      metrics: {
        male: parseInt(metrics.male_count || 0, 10),
        female: parseInt(metrics.female_count || 0, 10),
        newEnrollments: parseInt(metrics.new_enrollments || 0, 10)
      },
      page,
      limit
    });
  } catch (error) {
    console.error("DB Query Error [getStudents]:", error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to retrieve students' });
  }
};

// Admin ONLY: Delete Student
export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = 'DELETE FROM students WHERE id = $1';
    let params = [id];
    if (req.school_id) {
      query += ' AND school_id = $2';
      params.push(req.school_id);
    }
    const { rowCount } = await pool.query(query, params);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Student not found' });
    }
    
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error("DB Query Error [deleteStudent]:", error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete student' });
  }
};

// Admin ONLY: Update Student
export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = studentSchema.parse(req.body);
    
    let passwordQuery = "";
    let params = [
      validatedData.name, 
      validatedData.email, 
      validatedData.parent_email, 
      validatedData.class_id,
      validatedData.gender || 'Unknown',
      validatedData.status || 'Active',
      validatedData.avatar || null,
      id
    ];
    let paramIndex = 9;

    if (validatedData.password) {
      const hash = await bcrypt.hash(validatedData.password, 10);
      passwordQuery += `, password = $${paramIndex}`;
      params.push(hash);
      paramIndex++;
    }

    if (validatedData.parent_password) {
      const hash = await bcrypt.hash(validatedData.parent_password, 10);
      passwordQuery += `, parent_password = $${paramIndex}`;
      params.push(hash);
      
      // If updating parent password, ideally update it for all siblings with the same parent email
      if (validatedData.parent_email) {
        await pool.query('UPDATE students SET parent_password = $1 WHERE parent_email = $2', [hash, validatedData.parent_email]);
      }
    }
    
    let schoolFilter = "";
    if (req.school_id) {
      schoolFilter = ` AND school_id = $${paramIndex}`;
      params.push(req.school_id);
      paramIndex++;
    }

    const { rows } = await pool.query(
      `UPDATE students 
       SET name = $1, email = $2, parent_email = $3, class_id = $4, gender = $5, status = $6, avatar = $7 ${passwordQuery}
       WHERE id = $8${schoolFilter} RETURNING *`,
      params
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Student not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    console.error("DB Query Error [updateStudent]:", error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update student' });
  }
};
