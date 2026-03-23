import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import db from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// ✅ DB connect (IMPORTANT)
db();

// ✅ SIMPLE CORS (no error version)
app.use(cors());

// Middleware
app.use(express.json());

// Routes
app.use("/api/user", userRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend working ✅");
});

// Server start
const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});