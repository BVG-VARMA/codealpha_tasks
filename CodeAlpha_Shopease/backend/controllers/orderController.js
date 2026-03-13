const db = require("../db/database");

async function fetchOrderWithItems(orderId, userId) {
  const order = await db.getAsync(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [orderId, userId],
  );
  if (!order) return null;
  const items = await db.allAsync(
    `
    SELECT oi.quantity, oi.unit_price,
           p.id AS product_id, p.name, p.image_url, p.category
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `,
    [orderId],
  );
  return { ...order, items };
}

async function createOrder(req, res) {
  try {
    const userId = req.user.id;
    const cartItems = await db.allAsync(
      `
      SELECT ci.quantity, p.id AS product_id, p.name, p.price, p.stock
      FROM cart_items ci JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = ?
    `,
      [userId],
    );

    if (!cartItems.length)
      return res.status(400).json({ error: "Your cart is empty." });

    for (const item of cartItems) {
      if (item.stock < item.quantity)
        return res
          .status(400)
          .json({ error: `Not enough stock for "${item.name}".` });
    }

    const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

    const orderId = await db.runTransaction(async () => {
      const { lastID } = await db.runAsync(
        "INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)",
        [userId, parseFloat(total.toFixed(2)), "pending"],
      );
      for (const item of cartItems) {
        await db.runAsync(
          "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
          [lastID, item.product_id, item.quantity, item.price],
        );
        await db.runAsync(
          "UPDATE products SET stock = stock - ? WHERE id = ?",
          [item.quantity, item.product_id],
        );
      }
      await db.runAsync("DELETE FROM cart_items WHERE user_id = ?", [userId]);
      return lastID;
    });

    const order = await fetchOrderWithItems(orderId, userId);
    res.status(201).json({ message: "Order placed!", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await db.allAsync(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id],
    );
    const result = await Promise.all(
      orders.map((o) => fetchOrderWithItems(o.id, req.user.id)),
    );
    res.json({ orders: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOrderById(req, res) {
  try {
    const order = await fetchOrderWithItems(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: "Order not found." });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createOrder, getMyOrders, getOrderById };
