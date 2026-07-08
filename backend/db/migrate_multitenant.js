import pool from './index.js';
import bcrypt from 'bcrypt';

async function migrate() {
  try {
    console.log("Starting multi-tenant migration...");
    
    // 1. Create schools table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schools (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          subscription_status VARCHAR(50) DEFAULT 'TRIAL' CHECK (subscription_status IN ('TRIAL', 'ACTIVE', 'SUSPENDED')),
          subscription_expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create user_settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
          email VARCHAR(255) PRIMARY KEY,
          profile JSONB DEFAULT '{}',
          notifications JSONB DEFAULT '{}',
          appearance JSONB DEFAULT '{}'
      )
    `);
    
    // Insert a default school if none exists
    const schoolRes = await pool.query(`
      INSERT INTO schools (name, subscription_status) 
      SELECT 'Default Demo School', 'ACTIVE' 
      WHERE NOT EXISTS (SELECT id FROM schools)
      RETURNING id
    `);
    let schoolId = 1;
    const schools = await pool.query('SELECT id FROM schools LIMIT 1');
    if (schools.rows.length > 0) schoolId = schools.rows[0].id;

    // 3. Drop existing role constraint and add new columns to staff
    await pool.query(`
      ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_role_check;
      ALTER TABLE staff ADD CONSTRAINT staff_role_check CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF', 'SECURITY'));
      
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE;
      ALTER TABLE staff ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    `);

    // Assign existing staff to the default school and give them a default password
    const hashedPassword = await bcrypt.hash('password123', 10);
    await pool.query(`UPDATE staff SET school_id = $1 WHERE school_id IS NULL`, [schoolId]);
    await pool.query(`UPDATE staff SET password = $1 WHERE password IS NULL`, [hashedPassword]);

    // 4. Create SUPER_ADMIN if not exists
    const adminCheck = await pool.query(`SELECT id FROM staff WHERE role = 'SUPER_ADMIN'`);
    if (adminCheck.rows.length === 0) {
      const superadminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@erp.com';
      const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'password123';
      const hashedSuperadminPassword = await bcrypt.hash(superadminPassword, 10);
      await pool.query(`
        INSERT INTO staff (name, email, password, role, school_id)
        VALUES ('Super Admin', $1, $2, 'SUPER_ADMIN', NULL)
      `, [superadminEmail, hashedSuperadminPassword]);
      console.log(`Super Admin created: ${superadminEmail} / ${superadminPassword}`);
    }

    // 5. Add school_id to other tables
    const tables = ['classes', 'students'];
    for (const table of tables) {
      await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE`);
      await pool.query(`UPDATE ${table} SET school_id = $1 WHERE school_id IS NULL`, [schoolId]);
    }

    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

migrate();
