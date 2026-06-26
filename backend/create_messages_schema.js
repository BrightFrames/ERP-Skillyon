import 'dotenv/config';
import pool from './db/index.js';
async function schema() {
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS parent_messages ( id SERIAL PRIMARY KEY, student_id INTEGER REFERENCES students(id) ON DELETE CASCADE, sender VARCHAR(50) NOT NULL, content TEXT NOT NULL, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP );');
    console.log('parent_messages table created');
    const { rows } = await pool.query('SELECT id FROM students LIMIT 1');
    if (rows.length > 0) {
      await pool.query('INSERT INTO parent_messages (student_id, sender, content) VALUES ($1, $2, $3)', [rows[0].id, 'PARENT', 'Hi, I would like an update on my childs progress.']);
      await pool.query('INSERT INTO parent_messages (student_id, sender, content) VALUES ($1, $2, $3)', [rows[0].id, 'TEACHER', 'They are doing great! See the recent marks.']);
    }
  } catch(e) { console.error(e); } finally { process.exit(); }
}
schema();
