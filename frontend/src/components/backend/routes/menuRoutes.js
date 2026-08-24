//menuRoutes.js
import express from "express";
import {upload} from "../models/cloudinary.js";
import { addMenuItem, getMenu, getAdminMenu, getCategories, updateMenuItem, toggleMenuAvailability, deleteMenuItem } from "../controllers/menuController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, isAdmin, upload.single("image"), addMenuItem);
router.get("/", getMenu);
router.get("/categories", getCategories);
router.get("/admin", verifyToken, isAdmin, getAdminMenu);
router.put("/:id", verifyToken, isAdmin, upload.single("image"), updateMenuItem);
router.patch("/:id/availability", verifyToken, isAdmin, toggleMenuAvailability);
router.delete("/:id", verifyToken, isAdmin, deleteMenuItem);

export default router;
