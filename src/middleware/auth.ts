import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    req.user = decoded;
    next();
    return;
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}; 