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
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const imageDirectory = path.resolve(currentDirectory, "images");

// 1. SECURITY & UTILITY MIDDLEWARES (Must come FIRST)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(compression());
app.use(express.json());

/*
// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);


app.use(cors({
  origin: (origin, callback) => {
    const isLocalDevelopmentOrigin = origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
*/

// backend/server.js
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://rajancloudkitchen.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Render health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Return false instead of throwing a new Error() to avoid crashing Node
      return callback(null, false);
    },
    credentials: true,
  })
);



// Rate Limiter for Auth Routes (Prevents Brute-Force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per windowMs
  message: { message: "Too many login/register attempts. Please try again later." }
});

// General Rate Limiter for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,// Increased limit for normal API usage
});

// 2. STATIC FILES
app.use("/images", express.static(imageDirectory));

// 3. API ROUTES
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

// 4. 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// 5. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack);
  res.status(500).json({ 
    message: err.message || "Internal Server Error" 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on ${PORT}`));