//authRoutes.js
import express from "express";
import { body } from "express-validator";
import { registerUser, loginUser, getProfile, updateProfile, forgotPassword, resetPassword, logoutUser } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  body("full_name")
    .matches(/^[A-Z][a-z]{2,}(?: [A-Z][a-z]{2,}){1,3}$/)
    .withMessage("Full name must be like 'Ram Kumar' with 2-4 words, each 3+ letters, starting with a capital letter."),
  body("phone")
    .matches(/^(98|97)\d{8}$/)
    .withMessage("Phone must be 10 digits and start with 98 or 97."),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  registerUser
);

router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

export default router;
