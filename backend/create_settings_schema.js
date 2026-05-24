import 'dotenv/config';
import pool from './db/index.js';

async function schema() {
  try {
    await pool.query("CREATE TABLE IF NOT EXISTS user_settings ( email VARCHAR(255) PRIMARY KEY, profile JSONB DEFAULT '{}'::jsonb, notifications JSONB DEFAULT '{}'::jsonb, appearance JSONB DEFAULT '{}'::jsonb );");
    console.log('user_settings table created');
  } catch(e) { console.error(e); } finally { process.exit(); }
}
schema();