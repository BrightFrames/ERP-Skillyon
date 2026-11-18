import pool from '../db/index.js';
import bcrypt from 'bcrypt';

// GET all staff (filtered by role if provided query param)
export const getStaff = async (req, res) => {
  const { role } = req.query;
  try {
    let queryArgs = [];
    let queryText = `
      SELECT 
        s.id, s.name, s.email, s.role, s.subject, s.join_date,
        s.is_class_teacher, s.class_teacher_of, s.assigned_classes, s.assigned_subjects,
        s.permissions,
        c.name AS class_teacher_of_name
      FROM staff s
      LEFT JOIN classes c ON s.class_teacher_of = c.id
    `;
    let whereClauses = [];
    
    if (req.school_id) {
      whereClauses.push(`s.school_id = $${queryArgs.length + 1}`);
      queryArgs.push(req.school_id);
    }

    if (role) {
      whereClauses.push(`s.role = $${queryArgs.length + 1}`);
      queryArgs.push(role);
    } 

    if (whereClauses.length > 0) {
      queryText += ' WHERE ' + whereClauses.join(' AND ');
    }
    queryText += ' ORDER BY s.join_date DESC';
    
    const result = await pool.query(queryText, queryArgs);
    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

// POST to create a new staff member (Teacher or Worker)
export const createStaff = async (req, res) => {
  const { 
    name, 
    email, 
    role, 
    subject, 
    password, 
    is_class_teacher, 
    class_teacher_of, 
    assigned_classes, 
    assigned_subjects,
    permissions
  } = req.body;

  if (!name || !email || !role || !password) {
    return res.status(400).json({ success: false, error: 'Missing required fields: name, email, role, password.' });
  }

  try {
    const checkEmail = await pool.query('SELECT id FROM staff WHERE email = $1', [email]);
    if (checkEmail.rowCount > 0) {
      return res.status(409).json({ success: false, error: 'User with this email already exists.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const isClassTeacher = role === 'TEACHER' ? Boolean(is_class_teacher) : false;
    const parsedCT = parseInt(class_teacher_of, 10);
    const classTeacherOf = (role === 'TEACHER' && isClassTeacher && !isNaN(parsedCT)) ? parsedCT : null;
    
    let rawAssigned = Array.isArray(assigned_classes) ? assigned_classes : [];
    const classSet = new Set(rawAssigned.map(c => parseInt(c, 10)).filter(n => !isNaN(n)));
    if (isClassTeacher && classTeacherOf) {
      classSet.add(classTeacherOf);
    }
    const finalAssignedClasses = Array.from(classSet);
    const assignedClassesJSON = JSON.stringify(finalAssignedClasses);
    const assignedSubjectsJSON = JSON.stringify(Array.isArray(assigned_subjects) ? assigned_subjects : []);
    const permissionsJSON = JSON.stringify(Array.isArray(permissions) ? permissions : []);

    const result = await pool.query(
      `INSERT INTO staff (
        name, email, role, subject, password, join_date, school_id,
        is_class_teacher, class_teacher_of, assigned_classes, assigned_subjects, permissions
       )
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb)
       RETURNING id, name, email, role, subject, join_date, is_class_teacher, class_teacher_of, assigned_classes, assigned_subjects, permissions`,
      [
        name, 
        email, 
        role, 
        subject || null, 
        passwordHash, 
        req.school_id || null,
        isClassTeacher,
        classTeacherOf,
        assignedClassesJSON,
        assignedSubjectsJSON,
        permissionsJSON
      ]
    );

    const newStaff = result.rows[0];

    // If assigned as class teacher, sync classes.teacher_id
    if (classTeacherOf) {
      await pool.query('UPDATE classes SET teacher_id = $1 WHERE id = $2', [newStaff.id, classTeacherOf]);
    }

    res.status(201).json({ success: true, data: newStaff });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

// PUT to update a staff member by ID
export const updateStaff = async (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    email, 
    role, 
    subject, 
    password, 
    is_class_teacher, 
    class_teacher_of, 
    assigned_classes, 
    assigned_subjects,
    permissions 
  } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ success: false, error: 'Name, email, and role are required.' });
  }

  try {
    const checkEmail = await pool.query('SELECT id FROM staff WHERE email = $1 AND id != $2', [email, id]);
    if (checkEmail.rowCount > 0) {
      return res.status(409).json({ success: false, error: 'Another user with this email already exists.' });
    }

    const isClassTeacher = role === 'TEACHER' ? Boolean(is_class_teacher) : false;
    const parsedCT = parseInt(class_teacher_of, 10);
    const classTeacherOf = (role === 'TEACHER' && isClassTeacher && !isNaN(parsedCT)) ? parsedCT : null;
    
    let rawAssigned = Array.isArray(assigned_classes) ? assigned_classes : [];
    const classSet = new Set(rawAssigned.map(c => parseInt(c, 10)).filter(n => !isNaN(n)));
    if (isClassTeacher && classTeacherOf) {
      classSet.add(classTeacherOf);
    }
    const finalAssignedClasses = Array.from(classSet);
    const assignedClassesJSON = JSON.stringify(finalAssignedClasses);
    const assignedSubjectsJSON = JSON.stringify(Array.isArray(assigned_subjects) ? assigned_subjects : []);
    const permissionsJSON = permissions !== undefined ? JSON.stringify(Array.isArray(permissions) ? permissions : []) : null;

    let query = `
      UPDATE staff 
      SET name = $1, email = $2, role = $3, subject = $4,
          is_class_teacher = $5, class_teacher_of = $6,
          assigned_classes = $7::jsonb, assigned_subjects = $8::jsonb
    `;
    let params = [
      name, email, role, subject || null,
      isClassTeacher, classTeacherOf, assignedClassesJSON, assignedSubjectsJSON
    ];

    if (permissionsJSON !== null) {
      query += `, permissions = $${params.length + 1}::jsonb`;
      params.push(permissionsJSON);
    }

    if (password && password.trim().length >= 6) {
      const passwordHash = await bcrypt.hash(password, 10);
      query += `, password = $${params.length + 1}`;
      params.push(passwordHash);
    }

    query += ` WHERE id = $${params.length + 1}`;
    params.push(id);

    query += ` RETURNING id, name, email, role, subject, is_class_teacher, class_teacher_of, assigned_classes, assigned_subjects, permissions`;

    const result = await pool.query(query, params);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Staff member not found' });
    }

    const updatedStaff = result.rows[0];

    // Clear previous class teacher assignments for this staff member
    await pool.query('UPDATE classes SET teacher_id = NULL WHERE teacher_id = $1', [updatedStaff.id]);

    // If assigned as class teacher, set new class teacher
    if (classTeacherOf) {
      await pool.query('UPDATE classes SET teacher_id = $1 WHERE id = $2', [updatedStaff.id, classTeacherOf]);
    }

    res.json({ success: true, data: updatedStaff });
  } catch (error) {
    console.error('Error updating staff:', error);
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'Another user with this email already exists.' });
    }
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

// DELETE a staff member by ID (Admin only)
export const deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    const queryText = 'DELETE FROM staff WHERE id = $1 RETURNING id';
    const queryArgs = [id];
    
    const result = await pool.query(queryText, queryArgs);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Staff member not found' });
    }
    await pool.query('UPDATE classes SET teacher_id = NULL WHERE teacher_id = $1', [id]);
    res.json({ success: true, message: 'Staff member deleted' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

