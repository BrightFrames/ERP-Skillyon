import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.js';
import studentRoutes from './routes/students.js';
import staffRoutes from './routes/staff.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // Allow multiple Vite ports
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);

// Global Error Handler (secure-fullstack-dev requirement: No sensitive DB fields are leaked)
app.use((err, req, res, next) => {
  console.error('[Error]:', err.message);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running securely on http://localhost:${PORT}`);
});
