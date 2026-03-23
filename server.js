import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import db from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import cakeRouter from "./routes/cakeRouter.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";

dotenv.config();

// DB connect
db();

const app = express();

// ✅ CORS CONFIG (FIXED)
const allowedOrigins = [
  "http://localhost:5173",
  "https://effervescent-selkie-cde19c.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

// Handle preflight requests
app.options("*", cors());

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/cake", cakeRouter);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("🍰 Cake Shop Backend is running!");
});

// Error handler
app.use(errorHandler);

// Server start
const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});