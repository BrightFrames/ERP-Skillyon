import { z } from 'zod';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
  }
  next();
};

export const requireSchool = (req, res, next) => {
  // SUPER_ADMIN can access everything without a school context
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    return next();
  }
  if (!req.user || !req.user.school_id) {
    return res.status(403).json({ error: 'Forbidden: No school context found' });
  }
  req.school_id = req.user.school_id;
  next();
};

export const validatePaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("0"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10")
});

export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', message: error.errors });
  }
};
