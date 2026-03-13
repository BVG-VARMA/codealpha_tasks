const db = require("../db/database");

async function getAllProducts(req, res) {
  try {
    const { category, search } = req.query;
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];
    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (search) {
      sql += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += " ORDER BY id ASC";
    const products = await db.allAsync(sql, params);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getCategories(req, res) {
  try {
    const rows = await db.allAsync(
      "SELECT DISTINCT category FROM products ORDER BY category",
    );
    res.json({ categories: rows.map((r) => r.category) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProductById(req, res) {
  try {
    const product = await db.getAsync("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAllProducts, getCategories, getProductById };
