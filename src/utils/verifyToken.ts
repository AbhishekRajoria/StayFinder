import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const verifyToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    return decoded.id;
  } catch (error) {
    return null;
  }
}; 