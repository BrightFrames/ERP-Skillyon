import pool from './index.js';

async function setupFeesV2() {
  try {
    console.log('Setting up Fees Database Schema V2...');

    // 1. Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fee_types (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          description TEXT,
          school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fine_rules (
          id SERIAL PRIMARY KEY,
          rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('FIXED', 'PERCENTAGE')),
          rule_value DECIMAL(10, 2) NOT NULL,
          school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fee_assignments (
          id SERIAL PRIMARY KEY,
          student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
          fee_type_id INTEGER REFERENCES fee_types(id) ON DELETE CASCADE,
          amount DECIMAL(10, 2) NOT NULL,
          paid_amount DECIMAL(10, 2) DEFAULT 0.00,
          remaining_amount DECIMAL(10, 2) NOT NULL,
          due_date DATE NOT NULL,
          status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Partially Paid', 'Paid', 'Overdue')),
          fine_amount DECIMAL(10, 2) DEFAULT 0.00,
          last_payment_date DATE,
          school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          receipt_number VARCHAR(100) UNIQUE NOT NULL,
          student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
          fee_assignment_id INTEGER REFERENCES fee_assignments(id) ON DELETE CASCADE,
          amount DECIMAL(10, 2) NOT NULL,
          fine_paid DECIMAL(10, 2) DEFAULT 0.00,
          payment_status VARCHAR(20) DEFAULT 'Paid' CHECK (payment_status IN ('Pending', 'Partially Paid', 'Paid', 'Failed')),
          payment_method VARCHAR(50),
          payment_date DATE DEFAULT CURRENT_DATE,
          school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS invoices (
          id SERIAL PRIMARY KEY,
          invoice_number VARCHAR(100) UNIQUE NOT NULL,
          student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
          fee_assignment_id INTEGER REFERENCES fee_assignments(id) ON DELETE CASCADE,
          original_amount DECIMAL(10, 2) NOT NULL,
          fine_amount DECIMAL(10, 2) DEFAULT 0.00,
          total_due DECIMAL(10, 2) NOT NULL,
          due_date DATE NOT NULL,
          generated_date DATE DEFAULT CURRENT_DATE,
          payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Overdue')),
          school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Fetch default school ID
    const schoolRes = await pool.query('SELECT id FROM schools LIMIT 1');
    const schoolId = schoolRes.rows.length > 0 ? schoolRes.rows[0].id : 1;

    // 3. Populate 18 standard fee categories
    const categories = [
      'Admission Fee',
      'Registration Fee',
      'Tuition Fee',
      'Examination Fee',
      'Development Fee',
      'Computer Fee',
      'Library Fee',
      'Laboratory Fee',
      'Sports Fee',
      'Activity / Cultural Fee',
      'Transportation (Bus) Fee',
      'Hostel Fee',
      'Uniform Fee',
      'Book & Stationery Fee',
      'Smart Class Fee',
      'Annual Fee',
      'Miscellaneous Fee',
      'Late Fee / Fine'
    ];

    for (const name of categories) {
      const { rows: existingType } = await pool.query(
        'SELECT id FROM fee_types WHERE name = $1 AND school_id = $2',
        [name, schoolId]
      );
      if (existingType.length === 0) {
        await pool.query(
          `INSERT INTO fee_types (name, description, school_id) VALUES ($1, $2, $3)`,
          [name, `${name} for school year`, schoolId]
        );
      }
    }

    // 4. Populate default fine rules
    const { rows: existingRule } = await pool.query('SELECT id FROM fine_rules WHERE school_id = $1', [schoolId]);
    if (existingRule.length === 0) {
      await pool.query(
        `INSERT INTO fine_rules (rule_type, rule_value, school_id) VALUES ('FIXED', 100.00, $1)`,
        [schoolId]
      );
    }

    // 5. Seed some assignments for existing students (clear any previous assignments first to avoid dupes)
    await pool.query('DELETE FROM payments');
    await pool.query('DELETE FROM invoices');
    await pool.query('DELETE FROM fee_assignments');

    const { rows: students } = await pool.query('SELECT id, name FROM students LIMIT 10');
    const { rows: types } = await pool.query('SELECT id, name FROM fee_types WHERE school_id = $1', [schoolId]);

    const tuitionType = types.find(t => t.name === 'Tuition Fee');
    const sportsType = types.find(t => t.name === 'Sports Fee');
    const examType = types.find(t => t.name === 'Examination Fee');

    for (const student of students) {
      if (tuitionType) {
        // Unpaid pending tuition fee (due in 15 days)
        await pool.query(
          `INSERT INTO fee_assignments (student_id, fee_type_id, amount, paid_amount, remaining_amount, due_date, status, school_id)
           VALUES ($1, $2, 4500.00, 0.00, 4500.00, CURRENT_DATE + INTERVAL '15 days', 'Pending', $3)`,
          [student.id, tuitionType.id, schoolId]
        );
      }

      if (sportsType) {
        // Overdue sports fee (due 5 days ago)
        await pool.query(
          `INSERT INTO fee_assignments (student_id, fee_type_id, amount, paid_amount, remaining_amount, due_date, status, fine_amount, school_id)
           VALUES ($1, $2, 800.00, 0.00, 900.00, CURRENT_DATE - INTERVAL '5 days', 'Overdue', 100.00, $3)`,
          [student.id, sportsType.id, schoolId]
        );
      }

      if (examType) {
        // Paid examination fee
        const { rows: assignment } = await pool.query(
          `INSERT INTO fee_assignments (student_id, fee_type_id, amount, paid_amount, remaining_amount, due_date, status, last_payment_date, school_id)
           VALUES ($1, $2, 1200.00, 1200.00, 0.00, CURRENT_DATE - INTERVAL '2 days', 'Paid', CURRENT_DATE - INTERVAL '2 days', $3) RETURNING id`,
          [student.id, examType.id, schoolId]
        );
        
        // Add matching payment
        const receiptNo = `REC-${assignment[0].id}-${student.id}-${Date.now().toString().slice(-4)}`;
        await pool.query(
          `INSERT INTO payments (receipt_number, student_id, fee_assignment_id, amount, payment_status, payment_method, payment_date, school_id)
           VALUES ($1, $2, $3, 1200.00, 'Paid', 'UPI', CURRENT_DATE - INTERVAL '2 days', $4)`,
          [receiptNo, student.id, assignment[0].id, schoolId]
        );
      }
    }

    console.log('Fees Schema V2 set up and seeded successfully!');
  } catch (err) {
    console.error('Failed setting up database V2:', err);
  } finally {
    process.exit(0);
  }
}

setupFeesV2();
