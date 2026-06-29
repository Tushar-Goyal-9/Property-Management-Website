import express from 'express';
import {
  createInquiry,
  getMyInquiries,
  markAsRead,

} from '../controllers/inquiryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { body } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// router.route('/')
//   .post(protect, createInquiry)
  router.route('/')
  .post(
    protect,

    body("propertyId")
      .notEmpty()
      .withMessage("Property ID is required"),

    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid email")
      .normalizeEmail(),

    body("phone")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .isLength({ min: 10, max: 15 })
      .withMessage("Invalid phone number"),

    body("message")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Message must be between 10 and 1000 characters"),

    validate,

    createInquiry
  )
  .get(protect, getMyInquiries);

router.patch('/:id/read', protect, markAsRead);

export default router;