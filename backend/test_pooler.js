import pkg from 'pg';
const { Pool } = pkg;

// Trying different usernames for Supabase pooler
const pool = new Pool({
  connectionString: "postgresql://postgres:SupaDB%23Himanshu10@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connection successful with user postgres:', res.rows[0]);
  } catch (err) {
    console.error('Connection failed with user postgres:', err.message);
  }
  process.exit(0);
}

run();
