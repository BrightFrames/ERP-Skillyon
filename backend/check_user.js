import pool from './db/index.js';

async function check() {
  try {
    const { rows } = await pool.query('SELECT * FROM staff WHERE email = $1', ['superadmin@erp.com']);
    console.log('Superadmin user check result:', rows);
  } catch (err) {
    console.error('Error running check query:', err);
  } finally {
    process.exit(0);
  }
}

check();
