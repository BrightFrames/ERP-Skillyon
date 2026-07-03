import pool from './db/index.js';

async function run() {
  try {
    await pool.query(`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS father_name VARCHAR(255)
    `);
    console.log('Database updated successfully with father_name column!');
  } catch (err) {
    console.error('Error adding father_name column:', err);
  } finally {
    process.exit(0);
  }
}

run();
