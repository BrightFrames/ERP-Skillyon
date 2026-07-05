import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

// Use the DATABASE_URL connection string directly for Supabase/PostgreSQL (Postgres URI)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : undefined
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client from db pool:', err.stack);
  } else {
    console.log('Successfully connected to the database.');
    release();
  }
});

export default pool;
