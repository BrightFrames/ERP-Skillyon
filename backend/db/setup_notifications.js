import pool from './index.js';

async function setupNotificationsTable() {
  try {
    console.log('Altering/Creating tables for fees and notifications...');
    
    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        recipient_email VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        school_id INTEGER
      );
    `);
    
    console.log('Notifications table setup completed successfully.');
  } catch (error) {
    console.error('Error during database update:', error);
  } finally {
    await pool.end();
  }
}

setupNotificationsTable();
