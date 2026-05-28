import pool from './db/index.js';

async function deleteViv() {
  await pool.query('DELETE FROM staff WHERE email = $1', ['viv@gmail.com']);
  console.log('Deleted viv@gmail.com');
  process.exit(0);
}

deleteViv();
