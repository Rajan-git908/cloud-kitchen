import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { 
  getAllCategories, 
  getActiveCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  getCategoryStats 
} from "../controllers/categoryController.js";
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
    const baseName = path.basename(file.originalname, extension).replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
    cb(null, `category-${baseName}-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

// Public routes
router.get("/", getActiveCategories);
router.get("/all", getAllCategories);
router.get("/stats", verifyToken, isAdmin, getCategoryStats);
router.get("/:id", getCategoryById);

// Admin routes
router.post("/", verifyToken, isAdmin, upload.single("image"), createCategory);
router.put("/:id", verifyToken, isAdmin, upload.single("image"), updateCategory);
router.delete("/:id", verifyToken, isAdmin, deleteCategory);

export default router;