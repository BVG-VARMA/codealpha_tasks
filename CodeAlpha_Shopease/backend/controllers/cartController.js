const db = require("../db/database");

async function fetchCart(userId) {
  return db.allAsync(
    `
    SELECT ci.id AS cart_item_id, ci.quantity,
           p.id AS product_id, p.name, p.price, p.image_url, p.category, p.stock
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ? ORDER BY ci.id ASC
  `,
    [userId],
  );
}

async function getCart(req, res) {
  try {
    const items = await fetchCart(req.user.id);
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({ items, total: parseFloat(total.toFixed(2)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addToCart(req, res) {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId)
      return res.status(400).json({ error: "productId is required." });

    const product = await db.getAsync("SELECT * FROM products WHERE id = ?", [
      productId,
    ]);
    if (!product) return res.status(404).json({ error: "Product not found." });
    if (product.stock < quantity)
      return res.status(400).json({ error: `Only ${product.stock} in stock.` });

    const existing = await db.getAsync(
      "SELECT id FROM cart_items WHERE user_id = ? AND product_id = ?",
      [req.user.id, productId],
    );
    if (existing) {
      await db.runAsync(
        "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
        [quantity, existing.id],
      );
    } else {
      await db.runAsync(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [req.user.id, productId, quantity],
      );
    }

    const items = await fetchCart(req.user.id);
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({
      message: "Added to cart.",
      items,
      total: parseFloat(total.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateCartItem(req, res) {
  try {
    const { quantity } = req.body;
    const { cartItemId } = req.params;
    if (!quantity || quantity < 1)
      return res.status(400).json({ error: "Quantity must be at least 1." });

    const item = await db.getAsync(
      "SELECT * FROM cart_items WHERE id = ? AND user_id = ?",
      [cartItemId, req.user.id],
    );
    if (!item) return res.status(404).json({ error: "Cart item not found." });

    await db.runAsync("UPDATE cart_items SET quantity = ? WHERE id = ?", [
      quantity,
      cartItemId,
    ]);
    const items = await fetchCart(req.user.id);
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({ items, total: parseFloat(total.toFixed(2)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function removeFromCart(req, res) {
  try {
    const result = await db.runAsync(
      "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
      [req.params.cartItemId, req.user.id],
    );
    if (result.changes === 0)
      return res.status(404).json({ error: "Cart item not found." });
    const items = await fetchCart(req.user.id);
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({
      message: "Item removed.",
      items,
      total: parseFloat(total.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function clearCart(req, res) {
  try {
    await db.runAsync("DELETE FROM cart_items WHERE user_id = ?", [
      req.user.id,
    ]);
    res.json({ message: "Cart cleared.", items: [], total: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
