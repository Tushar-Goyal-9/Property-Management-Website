import express from 'express';
import {
  createInquiry,
  getMyInquiries,
  markAsRead,
} from '../controllers/inquiryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createInquiry)
  .get(protect, getMyInquiries);

router.patch('/:id/read', protect, markAsRead);

export default router;