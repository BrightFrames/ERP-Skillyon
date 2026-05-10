import pool from './db/index.js';

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        class_id INTEGER REFERENCES classes(id),
        teacher_id INTEGER,
        name VARCHAR(100),
        type VARCHAR(50),
        date DATE,
        max_score INTEGER DEFAULT 100
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        score INTEGER,
        UNIQUE(assessment_id, student_id)
      );
    `);
    console.log('Tables assessments and grades created successfully');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

setup();
