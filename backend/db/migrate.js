import pool from './index.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  try {
    const initSqlPath = path.join(__dirname, 'init.sql');
    if (fs.existsSync(initSqlPath)) {
      const sql = fs.readFileSync(initSqlPath, 'utf-8');
      await pool.query(sql);
    }

    // Incremental column safety checks
    await pool.query(`
      ALTER TABLE students ADD COLUMN IF NOT EXISTS father_name VARCHAR(255);
      ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_role_check;
      ALTER TABLE staff ADD CONSTRAINT staff_role_check CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF', 'SECURITY'));
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE assessments ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE assessments ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE assessments ADD COLUMN IF NOT EXISTS due_date DATE;
      ALTER TABLE assessments ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255);
      ALTER TABLE assessments ADD COLUMN IF NOT EXISTS attachment_data TEXT;
      ALTER TABLE assessments ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE;
    `);

    // Ensure superadmin account exists
    const superadminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@erp.com';
    const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'password123';
    if (superadminEmail && superadminPassword) {
      const hashedPassword = await bcrypt.hash(superadminPassword, 10);
      await pool.query(`
        INSERT INTO staff (name, email, password, role, school_id)
        VALUES ('Super Admin', $1, $2, 'SUPER_ADMIN', NULL)
        ON CONFLICT (email) DO UPDATE 
        SET password = $2, role = 'SUPER_ADMIN'
      `, [superadminEmail, hashedPassword]);
    }

    console.log('[DB] Database schema and superadmin verified successfully');
  } catch (error) {
    console.warn('[DB] Database initialization note:', error.message);
  }
}

// Standalone execution support: node db/migrate.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

