import express from "express";
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const router = express.Router();

// Order model
const Order = sequelize.define("Order", {
  email: { type: DataTypes.STRING, allowNull: false },
  items: { type: DataTypes.TEXT, allowNull: false },
  total_price: { type: DataTypes.FLOAT, allowNull: false },
  payment_status: { type: DataTypes.STRING, defaultValue: "pending" }
});
await Order.sync();

// GET all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [["createdAt", "DESC"]] });
    const formatted = orders.map(order => {
      let cakeNames = "-";
      try {
        const list = JSON.parse(order.items || "[]");
        if (Array.isArray(list) && list.length > 0) {
          cakeNames = list.map(i => `${i.name} (x${i.quantity})`).join(", ");
        }
      } catch {}
      return {
        id: order.id,
        customer_email: order.email,
        cake_name: cakeNames,
        amount: Number(order.total_price),
        status: order.payment_status,
        created_at: order.createdAt
      };
    });
    res.json(formatted);
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;