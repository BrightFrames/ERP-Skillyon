import pool from './db/index.js';
import bcrypt from 'bcrypt';

async function updateSchema() {
  try {
    // Add password column if not exists
    await pool.query(`
      ALTER TABLE staff
      ADD COLUMN IF NOT EXISTS password VARCHAR(255)
    `);

    // Generate hash for 'demo-password'
    const saltRounds = 10;
    const defaultPasswordHash = await bcrypt.hash('demo-password', saltRounds);

    // Update existing staff members with default password hash if they don't have a password
    await pool.query(`
      UPDATE staff SET password = $1 WHERE password IS NULL
    `, [defaultPasswordHash]);

    console.log('Staff table schema updated and default passwords set successfully!');
  } catch (err) {
    console.error('Error updating staff schema:', err);
  } finally {
    process.exit(0);
  }
}

updateSchema();
