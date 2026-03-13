const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/database");

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required." });
    if (password.length < 6)
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });

    const exists = await db.getAsync("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (exists)
      return res.status(409).json({ error: "Email already registered." });

    const hashed = bcrypt.hashSync(password, 10);
    const result = await db.runAsync(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed],
    );
    const user = { id: result.lastID, name, email };
    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ error: "Email and password are required." });

    const user = await db.getAsync("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: "Invalid email or password." });

    const payload = { id: user.id, name: user.name, email: user.email };
    res.json({ user: payload, token: signToken(payload) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMe(req, res) {
  try {
    const user = await db.getAsync(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [req.user.id],
    );
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login, getMe };
