import express from "express";
import {
  addProperty,
  getAllProperties,
  getPropertyById,
} from "../controllers/propertyController.js";

// 👇 import BOTH middlewares
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ===============================
// PUBLIC ROUTES
// ===============================

// Get all properties (anyone can see)
router.get("/", getAllProperties);

// Get single property (anyone can see)
router.get("/:id", getPropertyById);

// ===============================
// ADMIN PROTECTED ROUTE
// ===============================

// Add property (ONLY admin)
router.post("/", protect, adminOnly, addProperty);

export default router;
