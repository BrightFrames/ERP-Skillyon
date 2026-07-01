import pool from './db/index.js';
import bcrypt from 'bcrypt';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create schools table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subscription_status VARCHAR(50) DEFAULT 'TRIAL' CHECK (subscription_status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED')),
        subscription_expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ schools table created');

    // 2. Add school_id column to existing tables
    const tables = ['staff', 'classes', 'students', 'attendance', 'fees', 'marks'];
    for (const table of tables) {
      await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE`);
      console.log(`✅ school_id column added to ${table}`);
    }

    // 3. Drop and re-create the role CHECK constraint on staff to include SUPER_ADMIN
    await client.query(`ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_role_check`);
    await client.query(`ALTER TABLE staff ADD CONSTRAINT staff_role_check CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF', 'SECURITY'))`);
    console.log('✅ staff role constraint updated to include SUPER_ADMIN');

    // 4. Insert a default demo school and assign all existing records to it
    const { rows: schoolRows } = await client.query(
      `INSERT INTO schools (name, subscription_status) VALUES ('Demo School', 'ACTIVE') RETURNING id`
    );
    const demoSchoolId = schoolRows[0].id;
    console.log(`✅ Demo school created with id: ${demoSchoolId}`);

    for (const table of tables) {
      await client.query(`UPDATE ${table} SET school_id = $1 WHERE school_id IS NULL`, [demoSchoolId]);
      console.log(`✅ Existing ${table} records assigned to demo school`);
    }

    // 5. Create SUPER_ADMIN user
    const hashedPassword = await bcrypt.hash('super-admin-123', 10);
    await client.query(
      `INSERT INTO staff (name, email, password, role, school_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['Platform Owner', 'superadmin@skillyon.com', hashedPassword, 'SUPER_ADMIN', null]
    );
    console.log('✅ SUPER_ADMIN user created (superadmin@skillyon.com)');

    await client.query('COMMIT');
    console.log('\n🎉 Multi-tenancy migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }

  process.exit(0);
}

migrate();
