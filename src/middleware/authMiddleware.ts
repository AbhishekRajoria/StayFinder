import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/appError';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    // 1) Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      return next(new AppError(401, 'You are not logged in. Please log in to get access.'));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError(401, 'The user belonging to this token no longer exists.'));
    }

    // 4) Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    next(new AppError(401, 'You are not logged in. Please log in to get access.'));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'You are not logged in. Please log in to get access.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to perform this action'));
    }

    next();
  };
}; 