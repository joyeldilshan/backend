import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Order model (reuse from orderRoutes)
const Order = sequelize.define("Order", {
  email: { type: DataTypes.STRING, allowNull: false },
  items: { type: DataTypes.TEXT, allowNull: false },
  total_price: { type: DataTypes.FLOAT, allowNull: false },
  payment_status: { type: DataTypes.STRING, defaultValue: "pending" },
  payment_id: { type: DataTypes.STRING }
});
await Order.sync();

// CREATE CHECKOUT SESSION
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, total_price, email } = req.body;
    if (!items || !email || !total_price) return res.status(400).json({ error: "Missing order details" });

    const origin = req.headers.origin || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: items.map(i => ({
        price_data: {
          currency: "gbp",
          product_data: { name: i.name },
          unit_amount: Math.round(i.price * 100)
        },
        quantity: i.quantity
      })),
      metadata: { items: JSON.stringify(items), email, total_price },
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel.html`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// SAVE ORDER FROM SESSION
router.post("/save-order-session", async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "No session ID provided" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const items = JSON.parse(session.metadata.items);
    const email = session.metadata.email;
    const total_price = session.metadata.total_price;
    const payment_id = session.id;
    const payment_status = session.payment_status;

    await Order.create({ email, items: JSON.stringify(items), total_price, payment_id, payment_status });
    res.json({ success: true, message: "Order saved successfully" });
  } catch (err) {
    console.error("SAVE ORDER ERROR:", err);
    res.status(500).json({ message: "Failed to save order" });
  }
});

// STRIPE WEBHOOK
router.post("/webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const items = JSON.parse(session.metadata.items);
    const email = session.metadata.email;
    const total_price = session.metadata.total_price;
    const payment_id = session.id;
    const payment_status = session.payment_status;

    try {
      await Order.create({ email, items: JSON.stringify(items), total_price, payment_id, payment_status });
      console.log(`Webhook: Order saved for ${email}`);
    } catch (err) {
      console.error("Webhook DB ERROR:", err.message);
    }
  }

  res.json({ received: true });
});

export default router;