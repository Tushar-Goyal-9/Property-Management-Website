import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserCount,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  requestAgentAccess,
  getPendingAgentRequests,
  approveAgentRequest,
  rejectAgentRequest,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { body } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Public count route (or admin only as needed)
router.get('/count', getUserCount);

// Admin routes
router.route('/')
  .get(protect, admin, getUsers);

  router.post(
  "/request-agent",
  protect,

  body("agencyName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Agency name must be between 2 and 100 characters"),

  body("licenseNumber")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("License number is required"),

  validate,

  requestAgentAccess
);

router.get(
  "/agent-requests",
  protect,
  admin,
  getPendingAgentRequests
);

// Admin gets pending agent requests
router.get(
  "/agent-requests",
  protect,
  admin,
  getPendingAgentRequests
);

// Admin approves an agent request
router.patch(
  "/agent-requests/:id/approve",
  protect,
  admin,
  approveAgentRequest
);

router.patch(
  "/agent-requests/:id/reject",

  protect,
  admin,

  body("rejectionReason")
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Rejection reason must be between 5 and 500 characters"),

  validate,

  rejectAgentRequest
);


  // Wishlist routes (authenticated users)
router.route('/wishlist')
  .get(protect, getWishlist);

router.post('/wishlist/:id', protect, addToWishlist);
router.delete('/wishlist/:id', protect, removeFromWishlist);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);



export default router;