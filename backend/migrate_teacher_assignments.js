import pool from './db/index.js';

async function migrate() {
  try {
    console.log('Running migration: Adding teacher assignment columns to staff table...');
    
    await pool.query(`
      ALTER TABLE staff 
      ADD COLUMN IF NOT EXISTS is_class_teacher BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS class_teacher_of INTEGER REFERENCES classes(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS assigned_classes JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS assigned_subjects JSONB DEFAULT '[]'::jsonb;
    `);

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
