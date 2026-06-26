import express from 'express';
import { registerUser, loginUser, logoutUser, getMe, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected route
router.get('/me', protect, getMe);

// Forgot & Reset Password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;