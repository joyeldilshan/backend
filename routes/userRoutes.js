import express from "express";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";

const router = express.Router();

/*  GET ALL USERS  ( Admin Dashboard ) */
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const [users] = await db.execute(
      "SELECT id, name, email, phone, role FROM user"
    );
    res.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* 
   REGISTER USER / ADMIN
   API: POST /api/users/register
*/
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const db = await connectDB();

    // Check if user exists
    const [exist] = await db.execute(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (exist.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO user (name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [name, phone, email, hashedPassword, role]
    );

    res.json({ message: "Registration successful!" });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* 
   LOGIN USER
   API: POST /api/users/login
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role)
      return res.status(400).json({ message: "Email, password & role required" });

    const db = await connectDB();
    const [rows] = await db.execute("SELECT * FROM user WHERE email = ?", [email]);

    if (rows.length === 0)
      return res.status(400).json({ message: "User not found" });

    const user = rows[0];

    // Check role
    if (user.role !== role)
      return res.status(401).json({ message: "Invalid role" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password" });

    const { password: pw, ...safeUser } = user;

    res.json({ message: "Login successful", user: safeUser });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});


/*  UPDATE USER ( Admin Panel ) API: PUT /api/users/:id */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, role } = req.body;

    const db = await connectDB();

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute(
        "UPDATE user SET name=?, email=?, phone=?, role=?, password=? WHERE id=?",
        [name, email, phone, role, hashedPassword, id]
      );
    } else {
      await db.execute(
        "UPDATE user SET name=?, email=?, phone=?, role=? WHERE id=?",
        [name, email, phone, role, id]
      );
    }

    res.json({ message: "User updated successfully!" });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* DELETE USER ( Admin Panel ) API: DELETE /api/users/:id */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const db = await connectDB();
    await db.execute("DELETE FROM user WHERE id = ?", [id]);

    res.json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
