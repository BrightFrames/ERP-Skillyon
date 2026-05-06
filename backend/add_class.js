import pool from './db/index.js';

async function addClass() {
  await pool.query("INSERT INTO classes (name) VALUES ('Grade 10 - A')");
  console.log('Class added');
  process.exit(0);
}

addClass();
