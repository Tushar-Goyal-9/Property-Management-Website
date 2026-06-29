import express from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  toggleFeatured,
  getDashboardStats,
  getAdminDashboardStats,
} from '../controllers/propertyController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { body } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// ✅ Public + filter route
// router.route('/')
//   .get(getProperties)
//   .post(protect, createProperty);
router.route("/")
  .get(getProperties)
  .post(
    protect,

    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required"),

    body("description")
      .trim()
      .isLength({ min: 20 })
      .withMessage("Description must be at least 20 characters"),

    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),

    body("address")
      .trim()
      .notEmpty()
      .withMessage("Address is required"),

    body("city")
      .trim()
      .notEmpty()
      .withMessage("City is required"),

    body("bedrooms")
      .isInt({ min: 0 })
      .withMessage("Bedrooms must be 0 or greater"),

    body("bathrooms")
      .isInt({ min: 0 })
      .withMessage("Bathrooms must be 0 or greater"),

    body("area")
      .isFloat({ gt: 0 })
      .withMessage("Area must be greater than 0"),

    body("propertyType")
      .isIn(["Apartment", "House", "Villa", "Office", "Land", "Condo"])
      .withMessage("Invalid property type"),

    body("listingType")
      .isIn(["Sale", "Rent"])
      .withMessage("Invalid listing type"),
      
    body("listingStatus")
      .optional()
      .isIn(["active", "sold", "rented", "archived"])
      .withMessage("Invalid listing status"),  

    body("images")
      .isArray({ min: 1 })
      .withMessage("At least one image is required"),

    validate,

    createProperty
  );
  

// ✅ ADD THIS (VERY IMPORTANT)
router.get('/admin', protect, admin, getProperties);

router.get(
  '/admin/dashboard',
  protect,
  admin,
  getAdminDashboardStats
);

// Agent/Admin dashboard stats
router.get('/dashboard/stats', protect, getDashboardStats);

// ❗ MUST BE AFTER /admin
router.route('/:id')
  .get(getPropertyById)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

// Admin actions
router.patch('/:id/feature', protect, admin, toggleFeatured);

export default router;