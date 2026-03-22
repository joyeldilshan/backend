import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import connectDB from "../config/db.js";

const router = express.Router();

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

// Get all cakes
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const [cakes] = await db.execute("SELECT id, name, price, image FROM cake");

    // Convert price to number
    const result = cakes.map(c => ({
      ...c,
      price: parseFloat(c.price)
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("GET CAKES ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Create cake
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || !price) return res.status(400).json({ message: "Name and price required" });

    let imagePath = req.file ? "/" + req.file.path.replace(/\\/g, "/") : null;

    const db = await connectDB();
    const [result] = await db.execute(
      "INSERT INTO cake (name, price, image) VALUES (?, ?, ?)",
      [name, parseFloat(price), imagePath]
    );

    res.status(201).json({ message: "Cake created", id: result.insertId });
  } catch (error) {
    console.error("CREATE CAKE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update cake
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    const db = await connectDB();
    const [cakes] = await db.execute("SELECT * FROM cake WHERE id = ?", [id]);
    if (!cakes.length) return res.status(404).json({ message: "Cake not found" });

    const cake = cakes[0];
    const imagePath = req.file ? "/" + req.file.path.replace(/\\/g, "/") : cake.image;

    await db.execute(
      "UPDATE cake SET name = ?, price = ?, image = ? WHERE id = ?",
      [name || cake.name, price ? parseFloat(price) : cake.price, imagePath, id]
    );

    res.status(200).json({ message: "Cake updated successfully" });
  } catch (error) {
    console.error("UPDATE CAKE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete cake
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    const [cakes] = await db.execute("SELECT * FROM cake WHERE id = ?", [id]);
    if (!cakes.length) return res.status(404).json({ message: "Cake not found" });

    const cake = cakes[0];
    if (cake.image && fs.existsSync(cake.image.replace("/", ""))) {
      fs.unlinkSync(cake.image.replace("/", ""));
    }

    await db.execute("DELETE FROM cake WHERE id = ?", [id]);
    res.status(200).json({ message: "Cake deleted successfully" });
  } catch (error) {
    console.error("DELETE CAKE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
