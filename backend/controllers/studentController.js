import pool from '../db/index.js';
import { z } from 'zod';

// Zod schemas for validation
const studentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  parent_email: z.string().email().optional().nullable(),
  class_id: z.number().int().positive().optional().nullable(),
});

// Admin ONLY: Create Student
export const createStudent = async (req, res, next) => {
  try {
    const validatedData = studentSchema.parse(req.body);
    
    const { rows } = await pool.query(
      `INSERT INTO students (name, email, parent_email, class_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [validatedData.name, validatedData.email, validatedData.parent_email, validatedData.class_id]
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
    const offset = page * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM students');
    const total = parseInt(countResult.rows[0].count, 10);

    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.email, s.parent_email, c.name as class_name, s.enrollment_date 
       FROM students s
       LEFT JOIN classes c ON s.class_id = c.id
       ORDER BY s.id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.status(200).json({
      data: rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error("DB Query Error [getStudents]:", error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to retrieve students' });
  }
};
