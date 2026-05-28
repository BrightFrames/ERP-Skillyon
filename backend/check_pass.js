import pool from './db/index.js';

async function checkPass() {
  const { rows } = await pool.query('SELECT email, password FROM staff WHERE email = $1', ['viv@gmail.com']);
  console.log(rows);
  process.exit(0);
}

checkPass();
