import pool from './db/index.js';

async function run() {
  try {
    const res = await pool.query(
      'SELECT s.id, s.name, s.email, s.role, s.subject, s.password, s.school_id, sc.name as school_name, sc.subscription_status FROM staff s LEFT JOIN schools sc ON s.school_id = sc.id WHERE s.email = $1',
      ['admin@school.erp']
    );
    console.log('Query successful');
  } catch (err) {
    console.error('Error in login query:', err.message);
  }
  
  try {
    const res2 = await pool.query('SELECT * FROM students LIMIT 1');
    console.log('Students query successful');
  } catch (err) {
    console.error('Error in students query:', err.message);
  }
  
  process.exit(0);
}

run();
