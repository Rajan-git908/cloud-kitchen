//menuRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { addMenuItem, getMenu, getAdminMenu, getCategories, updateMenuItem, toggleMenuAvailability, deleteMenuItem } from "../controllers/menuController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const imageDirectory = path.resolve(currentDirectory, "../images");
fs.mkdirSync(imageDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageDirectory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const itemName = req.body.name 
      ? req.body.name.replace(/[^a-z0-9-_]/gi, "-").toLowerCase() 
      : "item";
    cb(null, `${itemName}-${Date.now()}${extension}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

router.post("/", verifyToken, isAdmin, upload.single("image"), addMenuItem);
router.get("/", getMenu);
router.get("/categories", getCategories);
router.get("/admin", verifyToken, isAdmin, getAdminMenu);
router.put("/:id", verifyToken, isAdmin, upload.single("image"), updateMenuItem);
router.patch("/:id/availability", verifyToken, isAdmin, toggleMenuAvailability);
router.delete("/:id", verifyToken, isAdmin, deleteMenuItem);

export default router;
