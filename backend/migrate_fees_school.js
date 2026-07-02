import pool from './db/index.js';

async function migrate() {
  try {
    await pool.query('ALTER TABLE fee_transactions ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE');
    await pool.query('UPDATE fee_transactions SET school_id = 1 WHERE school_id IS NULL');
    
    // Also check assessments
    const { rows: tables } = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    const tableNames = tables.map(t => t.table_name);
    
    if (tableNames.includes('assessments')) {
      await pool.query('ALTER TABLE assessments ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE');
      await pool.query('UPDATE assessments SET school_id = 1 WHERE school_id IS NULL');
    }
    
    console.log('Tables updated with school_id');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

migrate();
