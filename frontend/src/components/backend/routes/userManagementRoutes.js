import express from "express";
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getUserStats,
  getUserActivity
} from "../controllers/userManagementController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes for user management
router.get("/", verifyToken, isAdmin, getAllUsers);
router.get("/stats", verifyToken, isAdmin, getUserStats);
router.get("/:id", verifyToken, isAdmin, getUserById);
router.get("/:id/activity", verifyToken, isAdmin, getUserActivity);
router.post("/", verifyToken, isAdmin, createUser);
router.put("/:id", verifyToken, isAdmin, updateUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;