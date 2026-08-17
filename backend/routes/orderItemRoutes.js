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

// Admin routes for order item management
router.get("/order/:order_id", verifyToken, isAdmin, getOrderItems);
router.post("/", verifyToken, isAdmin, createOrderItem);
router.post("/bulk", verifyToken, isAdmin, bulkAddOrderItems);
router.put("/:id", verifyToken, isAdmin, updateOrderItem);
router.delete("/:id", verifyToken, isAdmin, deleteOrderItem);

export default router;