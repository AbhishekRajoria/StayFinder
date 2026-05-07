import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  refreshToken
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.post('/logout', logout);

export default router; 