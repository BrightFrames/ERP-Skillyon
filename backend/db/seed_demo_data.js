import pool from './index.js';

async function seed() {
  try {
    const { rows } = await pool.query("SELECT id, class_id FROM students WHERE name='Demo Child'");
    if(rows.length === 0) return;
    const student = rows[0];

    await pool.query(`INSERT INTO marks (student_id, class_id, subject, exam_name, score, max_score) 
      VALUES 
      ($1, $2, 'Math', 'Term 1', 85, 100),
      ($1, $2, 'Science', 'Term 1', 92, 100)
      ON CONFLICT DO NOTHING`, [student.id, student.class_id]);

    const fees = await pool.query("SELECT * FROM fees WHERE student_id=$1", [student.id]);
    if(fees.rows.length === 0) {
      await pool.query(`INSERT INTO fees (student_id, term, amount, status, due_date)
        VALUES
        ($1, 'Term 1 Fee', 1500, 'PAID', '2026-01-15'),
        ($1, 'Term 2 Fee', 1500, 'UNPAID', '2026-06-15')
      `, [student.id]);
    }
    
    await pool.query(`CREATE TABLE IF NOT EXISTS parent_messages (
        id SERIAL PRIMARY KEY,
        student_id INTEGER,
        sender VARCHAR(50),
        content TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    const msgs = await pool.query("SELECT * FROM parent_messages WHERE student_id=$1", [student.id]);
    if(msgs.rows.length === 0) {
      await pool.query(`INSERT INTO parent_messages (student_id, sender, content) VALUES
      ($1, 'TEACHER', 'Hello, demo child has been doing great in class recently!'),
      ($1, 'PARENT', 'Thank you! I will keep monitoring the progress.')`, [student.id]);
    }

    console.log("Demo data seeded.");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
seed();