import pool from '../db/index.js';
import { z } from 'zod';

// Zod schemas for validation
const studentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  parent_email: z.string().email().optional().nullable(),
  class_id: z.number().int().positive().optional().nullable(),
  gender: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  avatar: z.string().optional().nullable()
});

// Admin ONLY: Create Student
export const createStudent = async (req, res, next) => {
  try {
    const validatedData = studentSchema.parse(req.body);
    
    const { rows } = await pool.query(
      `INSERT INTO students (name, email, parent_email, class_id, gender, status, avatar) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        validatedData.name, 
        validatedData.email, 
        validatedData.parent_email, 
        validatedData.class_id,
        validatedData.gender || 'Unknown',
        validatedData.status || 'Active',
        validatedData.avatar || null
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
    const offset = page * limit;

    let metricsQueryStr = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN s.gender = 'Male' THEN 1 ELSE 0 END) as male_count,
        SUM(CASE WHEN s.gender = 'Female' THEN 1 ELSE 0 END) as female_count,
        SUM(CASE WHEN s.enrollment_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 ELSE 0 END) as new_enrollments
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
    `;
    let metricsParams = [];
    
    if (search) {
      metricsQueryStr += ` WHERE s.name ILIKE $1 OR s.email ILIKE $1 OR c.name ILIKE $1`;
      metricsParams.push(`%${search}%`);
    }

    const metricsResult = await pool.query(metricsQueryStr, metricsParams);
    const metrics = metricsResult.rows[0];
    const total = parseInt(metrics.total || 0, 10);

    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.email, s.parent_email, c.name as class_name, s.enrollment_date, s.gender, s.status, s.avatar 
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       ${search ? 'WHERE s.name ILIKE $3 OR s.email ILIKE $3 OR c.name ILIKE $3' : ''}
       ORDER BY s.id ASC
       LIMIT $1 OFFSET $2`,
      search ? [limit, offset, `%${search}%`] : [limit, offset]
    );

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
    const { rowCount } = await pool.query('DELETE FROM students WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Student not found' });
    }
    
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error("DB Query Error [deleteStudent]:", error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete student' });
  }
};
