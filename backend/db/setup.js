import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    const initSqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(initSqlPath, 'utf-8');

    console.log('Running database setup script...');
    await pool.query(sql);
    console.log('Database schema created successfully.');
  } catch (error) {
    console.error('Error setting up the database:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();
