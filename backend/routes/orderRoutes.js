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

// User routes
router.get("/", verifyToken, fetchOrders);
router.post("/", verifyToken, placeOrder); // Protected order endpoint
router.get("/:id", verifyToken, getOrderById);

// Admin routes
router.get("/admin", verifyToken, isAdmin, fetchAllOrders);
router.put("/:id/status", verifyToken, isAdmin, updateOrderStatus);

export default router;