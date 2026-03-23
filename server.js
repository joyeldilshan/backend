// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { sequelize } from "./config/db.js";

// Routers
import cakeRoutes from "./routes/cakeRouter.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve cake images

// ✅ Test route
app.get("/", (req, res) => res.send("Backend working ✅"));

// ✅ Routers
app.use("/api/cake", cakeRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoutes);

// ✅ Start server
const PORT = process.env.PORT || 8081;

(async () => {
  try {
    // Connect & sync SQLite
    await sequelize.authenticate();
    console.log("SQLite DB connected ✅");

    await sequelize.sync();
    console.log("All tables synced ✅");

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Server start error:", err);
  }
})();