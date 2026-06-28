import express from 'express';
import multer from 'multer';
import { getSignature, uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();



router.get('/signature', protect, getSignature);
router.post('/', protect, uploadLimiter, upload.single('image'), uploadImage);

export default router;