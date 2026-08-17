
import express from "express";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { 
  fetchOrders, 
  placeOrder, 
  fetchAllOrders, 
  getOrderById,
  updateOrderStatus
} from "../controllers/orderController.js";

const router = express.Router();

// Admin routes (Must be defined BEFORE /:id routes)
router.get("/admin", verifyToken, isAdmin, fetchAllOrders);
router.put("/:id/status", verifyToken, isAdmin, updateOrderStatus);

// User routes
router.get("/", verifyToken, fetchOrders);
router.post("/", verifyToken, placeOrder);
router.get("/:id", verifyToken, getOrderById);

export default router;