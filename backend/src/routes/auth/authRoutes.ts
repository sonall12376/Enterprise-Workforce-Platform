import { Router } from 'express';
import {
  login,
  refresh,
  forgotPassword,
  resetPassword,
  changePassword,
  signup,
} from '../../controllers/auth/authController';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Endpoint: POST /api/auth/signup
router.post('/signup', signup);

// Endpoint: POST /api/auth/login
router.post('/login', login);

// Endpoint: POST /api/auth/refresh
router.post('/refresh', refresh);

// Endpoint: POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// Endpoint: POST /api/auth/reset-password/:token
router.post('/reset-password/:token', resetPassword);

// Endpoint: POST /api/auth/change-password
router.post('/change-password', authenticate, changePassword);

export default router;
