import express from 'express';
import { registerUser, loginUser, logoutUser, getMe, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimitMiddleware.js';
import { body } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Public routes
// router.post('/register', registerLimiter, registerUser);
// Input validation for registration
router.post(
  "/register",
  registerLimiter,

  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email")
    .normalizeEmail(),

  body("phone")
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("role")
    .optional()
    .isIn(["user", "agent"])
    .withMessage("Invalid role"),

  body("agencyName")
    .if(body("role").equals("agent"))
    .notEmpty()
    .withMessage("Agency name is required"),

  body("licenseNumber")
    .if(body("role").equals("agent"))
    .notEmpty()
    .withMessage("License number is required"),

  validate,

  registerUser
);

// router.post('/login', loginLimiter, loginUser);
router.post(
  "/login",
  loginLimiter,

  body("email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  validate,

  loginUser
);

router.post('/logout', logoutUser);

// Protected route
router.get('/me', protect, getMe);

// Forgot & Reset Password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;