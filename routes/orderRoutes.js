import express from "express";
import connectDB from "../config/db.js";

const router = express.Router();

// GET all orders (most recent first)
router.get("/", async (req, res) => {
  try {
    const db = await connectDB(); // get connection

    const [rows] = await db.query(
      `SELECT id, email, items, total_price, payment_status, created_at 
       FROM orders 
       ORDER BY created_at DESC`
    );

    const finalData = rows.map(order => {
      let cakeNames = "-";

      try {
        const list = JSON.parse(order.items || "[]");
        if (Array.isArray(list) && list.length > 0) {
          cakeNames = list
            .map(item => `${item.name} (x${item.quantity})`)
            .join(", ");
        }
      } catch {}

      return {
        id: order.id,
        customer_email: order.email,
        cake_name: cakeNames,
        amount: Number(order.total_price),
        status: order.payment_status,
        created_at: order.created_at,
      };
    });

    res.json(finalData);
  } catch (err) {
    console.error("❌ Error loading orders:", err);
    res.status(500).json({ message: "Server error loading orders" });
  }
});

export default router;
