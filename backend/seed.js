import pool from './db/index.js';

async function seedData() {
  try {
    // Insert classes and get their IDs
    const classes = [
      'Grade 11 - A',
      'Grade 10 - B',
      'Grade 12 - A',
      'Grade 9 - C'
    ];
    
    const classIds = {};
    for (const className of classes) {
      const existing = await pool.query('SELECT id FROM classes WHERE name = $1', [className]);
      if (existing.rows.length > 0) {
        classIds[className] = existing.rows[0].id;
      } else {
        const res = await pool.query('INSERT INTO classes (name) VALUES ($1) RETURNING id', [className]);
        classIds[className] = res.rows[0].id;
      }
    }

    const students = [
      {
        name: 'Alexander Bennett',
        email: 'alexander.b@school.edu',
        class_id: classIds['Grade 11 - A']
      },
      {
        name: 'Eleanor Vance',
        email: 'e.vance@school.edu',
        class_id: classIds['Grade 10 - B']
      },
      {
        name: 'Marcus Thorne',
        email: 'm.thorne@school.edu',
        class_id: classIds['Grade 12 - A']
      },
      {
        name: 'Sophia Lin',
        email: 'sophia.lin@school.edu',
        class_id: classIds['Grade 9 - C']
      }
    ];

    for (const student of students) {
      const existing = await pool.query('SELECT id FROM students WHERE email = $1', [student.email]);
      if (existing.rows.length === 0) {
        await pool.query(
          'INSERT INTO students (name, email, class_id) VALUES ($1, $2, $3)',
          [student.name, student.email, student.class_id]
        );
      }
    }
    
    console.log('Database seeded with mock students successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    process.exit(0);
  }
}

seedData();
