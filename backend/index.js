import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db/migrate.js';

import userRoutes from './routes/user.js';
import studentRoutes from './routes/students.js';
import staffRoutes from './routes/staff.js';
import classesRoutes from './routes/classes.js';
import academicRoutes from './routes/academic.js';
import parentRoutes from './routes/parent.js';
import feesRoutes from './routes/fees.js';
import studentPortalRoutes from './routes/studentPortal.js';
import messagesRoutes from './routes/messages.js';
import superadminRoutes from './routes/superadmin/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// CORS Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'https://erp-skillyon-frontend.vercel.app',
  'https://erp-skillyon-super.vercel.app',
  'https://erp-skillyon-sa.vercel.app',
  'https://erp-skillyon-pare.vercel.app',
  'https://erp-skillyon-student.vercel.app',
  'http://localhost:5000'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    const isAllowed = allowedOrigins.includes(origin) ||
      origin.includes('localhost') ||
      origin.includes('vercel.app') ||
      origin.includes('skillyon');
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Skillyon ERP Backend API is running securely.' });
});

// Mount Routes
app.use('/api/user', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/student-portal', studentPortalRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/superadmin', superadminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]:', err.message);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message
  });
});

// Initialize database schema and verify superadmin on startup
initializeDatabase();

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running securely on http://localhost:${PORT}`);
  });
}

export default app;
