import express from 'express';
import multer from 'multer';
import { getSignature, uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Use memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/signature', protect, getSignature);
router.post('/', protect, uploadLimiter, upload.single('image'), uploadImage);

export default router;