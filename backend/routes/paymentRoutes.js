//paymentRoutes.js
import express from "express";
import { initiateEsewaPayment, verifyEsewaPayment } from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/esewa/initiate", verifyToken, initiateEsewaPayment);
router.post("/esewa/verify", verifyEsewaPayment);

export default router;