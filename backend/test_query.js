import pool from './db/index.js';

async function testQuery() {
  const metricsResult = await pool.query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male_count,
      SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female_count,
      SUM(CASE WHEN enrollment_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 ELSE 0 END) as new_enrollments
    FROM students
  `);
  console.log(metricsResult.rows[0]);
  process.exit(0);
}

testQuery();
