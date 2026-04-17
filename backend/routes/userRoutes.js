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
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public count route (or admin only as needed)
router.get('/count', getUserCount);

// Admin routes
router.route('/')
  .get(protect, admin, getUsers);

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