import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const router = express.Router();

// ✅ Cake Model
const Cake = sequelize.define("Cake", {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true }
});
await Cake.sync();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/cakes";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// GET all cakes
router.get("/", async (req, res) => {
  try {
    const cakes = await Cake.findAll();
    res.json(cakes);
  } catch (err) {
    console.error("GET CAKES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE cake
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price } = req.body;
    const image = req.file ? "/" + req.file.path.replace(/\\/g, "/") : null;
    const newCake = await Cake.create({ name, price: parseFloat(price), image });
    res.status(201).json({ message: "Cake created", cake: newCake });
  } catch (err) {
    console.error("CREATE CAKE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE cake
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    const cake = await Cake.findByPk(id);
    if (!cake) return res.status(404).json({ message: "Cake not found" });

    const image = req.file ? "/" + req.file.path.replace(/\\/g, "/") : cake.image;
    await cake.update({ name: name || cake.name, price: price ? parseFloat(price) : cake.price, image });
    res.json({ message: "Cake updated", cake });
  } catch (err) {
    console.error("UPDATE CAKE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE cake
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cake = await Cake.findByPk(id);
    if (!cake) return res.status(404).json({ message: "Cake not found" });

    if (cake.image && fs.existsSync(cake.image.replace("/", ""))) fs.unlinkSync(cake.image.replace("/", ""));
    await cake.destroy();
    res.json({ message: "Cake deleted" });
  } catch (err) {
    console.error("DELETE CAKE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;