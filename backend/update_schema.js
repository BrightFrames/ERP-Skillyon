import pool from './db/index.js';

async function updateSchema() {
  try {
    await pool.query(`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT 'Unknown',
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active',
      ADD COLUMN IF NOT EXISTS avatar VARCHAR(500)
    `);

    // Update the seeded students with their mock data
    const mockData = [
      {
        email: 'alexander.b@school.edu',
        gender: 'Male',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      {
        email: 'e.vance@school.edu',
        gender: 'Female',
        status: 'Inactive',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      {
        email: 'm.thorne@school.edu',
        gender: 'Male',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      {
        email: 'sophia.lin@school.edu',
        gender: 'Female',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    ];

    for (const data of mockData) {
      await pool.query(
        'UPDATE students SET gender = $1, status = $2, avatar = $3 WHERE email = $4',
        [data.gender, data.status, data.avatar, data.email]
      );
    }

    console.log('Schema updated and mock data augmented!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

updateSchema();
