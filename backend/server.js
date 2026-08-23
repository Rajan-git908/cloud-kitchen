import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

// Database
import db from "./models/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userManagementRoutes from "./routes/userManagementRoutes.js";
import orderItemRoutes from "./routes/orderItemRoutes.js";

dotenv.config();

const app = express();

// Trust proxy for Render / Cloudflare reverse proxies
app.set("trust proxy", 1);

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

// 1. SECURITY & UTILITY MIDDLEWARES
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(compression());
app.use(express.json());

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://rajancloudkitchen.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many login/register attempts. Please try again later." }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// 2. API ROUTES
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/menu", apiLimiter, menuRoutes);
app.use("/api/categories", apiLimiter, categoryRoutes);
app.use("/api/orders", apiLimiter, orderRoutes);
app.use("/api/order-items", apiLimiter, orderItemRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);
app.use("/api/admin/users", apiLimiter, userManagementRoutes);
app.use("/api/reviews", apiLimiter, reviewRoutes);

// Base route
app.get("/", (req, res) => {
  res.json({ message: "Backend server running successfully!" });
});

// 3. 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// 4. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack);
  res.status(500).json({ 
    message: err.message || "Internal Server Error" 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on ${PORT}`));