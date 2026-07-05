import pool from './db/index.js';

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connected successfully. Current time:', res.rows[0]);
  } catch (err) {
    console.error('Database connection failed:', err.message);
  } finally {
    process.exit(0);
  }
}

testConnection();
