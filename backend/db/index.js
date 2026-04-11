import pkg from 'pg';
const { Pool } = pkg;

// MOCK: Replace with real PostgreSQL URI
const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'erp_school',
  password: process.env.PG_PASSWORD || 'password',
  port: process.env.PG_PORT || 5432,
});

export default pool;
