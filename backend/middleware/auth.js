import { z } from 'zod';

// Middleware for token validation as per secure-fullstack-dev
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // MOCK: Replace with actual jwt.verify(token, process.env.JWT_SECRET)
    // For this example, we mock a parsed token
    // Example: token represents user ID 10
    if (token === 'expired') throw new Error('Token Expired');
    
    // Mock decoded user payload
    req.user = {
      id: 10,
      role: 'Teacher' // Based on RBAC constraints
    };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden', message: 'Token invalid or expired' });
  }
};

// Middleware for RBAC
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
    }
    next();
  };
};

// Pagination Schema Validation using Zod
export const validatePaginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("0"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("5")
});

export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Bad Request', message: error.errors });
  }
};
