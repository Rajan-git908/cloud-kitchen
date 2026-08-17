import express from "express";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { getAllTestimonials, updateTestimonial, deleteTestimonial } from "../controllers/adminController.js";
import { getAllUsers, getUserStats } from "../controllers/userManagementController.js";

const router = express.Router();

// User management routes
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.get("/users/stats", verifyToken, isAdmin, getUserStats);

// Testimonial/Review management routes (support both endpoints for compatibility)
router.get("/testimonials", verifyToken, isAdmin, getAllTestimonials);
router.get("/reviews", verifyToken, isAdmin, getAllTestimonials);
router.put("/testimonials/:id", verifyToken, isAdmin, updateTestimonial);
router.put("/reviews/:id", verifyToken, isAdmin, updateTestimonial);
router.delete("/testimonials/:id", verifyToken, isAdmin, deleteTestimonial);
router.delete("/reviews/:id", verifyToken, isAdmin, deleteTestimonial);

export default router;
