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
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); 

// Routes
app.use("/api/user", userRoutes);
app.use("/api/cake", cakeRouter);
app.use("/api/payment", paymentRoutes); 
app.use("/api/orders", orderRoutes);


// Health check
app.get("/", (req, res) => res.send("🍰 Cake Shop Backend is running!"));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () =>
  console.log(` Server running on http://localhost:${PORT}`)
);
