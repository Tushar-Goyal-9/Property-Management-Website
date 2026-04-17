import express from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  toggleFeatured,
} from '../controllers/propertyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Public + filter route
router.route('/')
  .get(getProperties)
  .post(protect, createProperty);

// ✅ ADD THIS (VERY IMPORTANT)
router.get('/admin', protect, admin, getProperties);

// ❗ MUST BE AFTER /admin
router.route('/:id')
  .get(getPropertyById)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

// Admin actions
router.patch('/:id/status', protect, admin, updatePropertyStatus);
router.patch('/:id/feature', protect, admin, toggleFeatured);

export default router;