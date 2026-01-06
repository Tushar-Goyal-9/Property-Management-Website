import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected test route
router.get("/protected", protect, (req, res) => {
  res.json({
    message: "You have accessed a protected route",
    user: req.user,
  });
});

export default router;
