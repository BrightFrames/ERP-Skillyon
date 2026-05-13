import pool from './db/index.js';

async function setupFees() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fee_transactions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
        student_name VARCHAR(100),
        class_name VARCHAR(100),
        amount NUMERIC(10,2) NOT NULL,
        fee_type VARCHAR(50) DEFAULT 'Tuition',
        status VARCHAR(20) DEFAULT 'Pending',
        invoice_date DATE DEFAULT CURRENT_DATE,
        due_date DATE,
        notes TEXT
      );
    `);

    const { rows: students } = await pool.query(
      'SELECT s.id, s.name, c.name as class_name FROM students s LEFT JOIN classes c ON s.class_id = c.id LIMIT 6'
    );

    const statuses = ['Paid', 'Pending', 'Overdue', 'Paid', 'Paid', 'Pending'];
    const amounts = [1250, 850, 1400, 1100, 950, 1300];

    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      await pool.query(
        `INSERT INTO fee_transactions (student_id, student_name, class_name, amount, status, due_date)
         VALUES ($1, $2, $3, $4, $5, CURRENT_DATE + INTERVAL '30 days')`,
        [s.id, s.name, s.class_name || 'Unassigned', amounts[i] || 1000, statuses[i] || 'Pending']
      );
    }

    console.log('Fee transactions table created and seeded!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

setupFees();
