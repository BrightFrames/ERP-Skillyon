import pool from './index.js';
import bcrypt from 'bcrypt';

async function migrate() {
  try {
    console.log("Starting migration: Adding password columns to students table...");
    
    // Add columns if they don't exist
    await pool.query(`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS password VARCHAR(255),
      ADD COLUMN IF NOT EXISTS parent_password VARCHAR(255)
    `);
    
    console.log("Columns added successfully.");
    
    // Set a default password 'password123' for existing records
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Update existing records where password is null
    const result = await pool.query(`
      UPDATE students 
      SET 
        password = COALESCE(password, $1),
        parent_password = COALESCE(parent_password, $1)
      WHERE password IS NULL OR parent_password IS NULL
    `, [hashedPassword]);
    
    console.log(`Updated ${result.rowCount} existing student records with default password '${defaultPassword}'.`);
    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

migrate();
