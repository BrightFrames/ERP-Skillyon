import pool from './db/index.js';

async function seedParent() {
  try {
    const parentEmail = 'parent@example.com';
    const classRes = await pool.query("SELECT id FROM classes LIMIT 1");
    let classId = classRes.rows[0]?.id;
    if (!classId) {
      const r = await pool.query("INSERT INTO classes (name) VALUES ($1) RETURNING id", ['Demo Class']);
      classId = r.rows[0].id;
    }

    const existing = await pool.query('SELECT id FROM students WHERE parent_email = $1', [parentEmail]);
    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO students (name, email, parent_email, class_id) VALUES ($1, $2, $3, $4)',
        ['Demo Child', 'demo.child@example.com', parentEmail, classId]
      );
      console.log('Inserted demo student with parent:', parentEmail);
    } else {
      console.log('Demo parent already exists in students table');
    }
  } catch (err) {
    console.error('Error seeding parent:', err);
  } finally {
    process.exit(0);
  }
}

seedParent();
