import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from '../config/env';
import User from "../models/User";
import { sendSuccess, sendError } from "../utils/responseHandler";

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: '30d',
  } as jwt.SignOptions);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'Email already registered', 400);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'guest',
    });

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/'
    });

    // Remove password from response
    const userResponse = user.toObject() as { password?: string };
    if (userResponse.password) {
      delete userResponse.password;
    }

    return sendSuccess(res, { user: userResponse }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/'
    });

    // Remove password from response
    const userResponse = user.toObject() as { password?: string };
    if (userResponse.password) {
      delete userResponse.password;
    }

    return sendSuccess(res, { user: userResponse }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(0),
    path: '/',
  });
  return sendSuccess(res, {}, 'Logged out successfully');
};

// @desc    Update user profile
// @route   PATCH /api/auth/profile
// @access  Private
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user?.id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();

    return sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return sendError(res, 'No token provided', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    
    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Generate new token
    const newToken = generateToken(user._id);

    // Set cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/'
    });

    return sendSuccess(res, { user }, 'Token refreshed successfully');
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return sendError(res, 'Invalid token', 401);
    }
    next(error);
  }
}; 