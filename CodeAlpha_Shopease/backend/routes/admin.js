const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const db = require("../db/database");

// Get all orders with user names
router.get("/orders", protect, async (req, res) => {
  try {
    const orders = await db.allAsync(`
      SELECT o.*, u.name AS user_name
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `);
    const result = await Promise.all(
      orders.map(async (o) => {
        const items = await db.allAsync(
          `SELECT oi.*, p.name FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?`,
          [o.id],
        );
        return { ...o, items };
      }),
    );
    res.json({ orders: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status
router.put("/orders/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status))
      return res.status(400).json({ error: "Invalid status" });
    await db.runAsync("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get("/users", protect, async (req, res) => {
  try {
    const users = await db.allAsync(
      "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC",
    );
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
