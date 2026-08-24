import express from "express";
import { 
  getReviews, 
  addReview, 
  getAllReviews, 
  updateReview, 
  deleteReview,
  getReviewById,
  markReviewHelpful,
  getReviewStats
} from "../controllers/reviewController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
// Public static routes
router.get("/", getReviews);
router.get("/stats", getReviewStats);
// Admin route
router.get("/admin/all", verifyToken, isAdmin, getAllReviews);
// Parameterized routes (Must come AFTER static sub-paths)
router.get("/:id", getReviewById);

// User routes
router.post("/", verifyToken, addReview);
router.post("/:id/helpful", verifyToken, markReviewHelpful);

// Admin update & delete
router.put("/:id", verifyToken, isAdmin, updateReview);
router.delete("/:id", verifyToken, isAdmin, deleteReview);

export default router;