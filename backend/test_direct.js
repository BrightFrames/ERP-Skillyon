import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:SupaDB%23Himanshu10@db.askoxzkqzjpuntznepjz.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Direct connection successful:', res.rows[0]);
  } catch (err) {
    console.error('Direct connection failed:', err.message);
  }
  process.exit(0);
}

run();
