
import express from "express";
import { 
  getOrderItems, 
  createOrderItem, 
  updateOrderItem, 
  deleteOrderItem,
  bulkAddOrderItems
} from "../controllers/orderItemController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Allow regular logged-in users to view order items
router.get("/order/:order_id", verifyToken, getOrderItems);

// Admin management routes
router.post("/", verifyToken, isAdmin, createOrderItem);
router.post("/bulk", verifyToken, isAdmin, bulkAddOrderItems);
router.put("/:id", verifyToken, isAdmin, updateOrderItem);
router.delete("/:id", verifyToken, isAdmin, deleteOrderItem);

export default router;