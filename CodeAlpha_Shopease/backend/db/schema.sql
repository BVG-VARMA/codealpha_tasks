-- ============================================================
--  schema.sql  –  E-commerce SQLite schema
-- ============================================================

PRAGMA foreign_keys = ON;

-- ── Users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  name       TEXT     NOT NULL,
  email      TEXT     NOT NULL UNIQUE,
  password   TEXT     NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Products ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  description TEXT,
  price       REAL    NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url   TEXT,
  category    TEXT    NOT NULL DEFAULT 'General'
);

-- ── Cart Items (server-side cart per user) ─────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE (user_id, product_id)
);

-- ── Orders ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  total      REAL    NOT NULL CHECK (total >= 0),
  status     TEXT    NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Order Items ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    INTEGER NOT NULL,
  product_id  INTEGER NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  REAL    NOT NULL CHECK (unit_price >= 0),
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ── Seed Products ──────────────────────────────────────────
INSERT OR IGNORE INTO products (id, name, description, price, stock, image_url, category) VALUES
  (1,  'Wireless Headphones',       'Premium noise-cancelling over-ear headphones, 30hr battery.',        89.99,  25, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 'Electronics'),
  (2,  'Mechanical Keyboard',       'Compact TKL RGB keyboard with tactile switches.',                    64.99,  40, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600', 'Electronics'),
  (3,  'Running Shoes',             'Lightweight breathable shoes with cushioned sole.',                  54.99,  60, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',  'Footwear'),
  (4,  'Minimalist Watch',          'Slim stainless steel watch with leather strap.',                    129.99,  15, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 'Accessories'),
  (5,  'Yoga Mat',                  'Non-slip eco-friendly 6mm mat with carrying strap.',                 29.99,  80, 'https://images.unsplash.com/photo-1601925228869-76b9e8a7e3b6?w=600', 'Sports'),
  (6,  'Ceramic Coffee Mug',        'Handcrafted 350ml ceramic mug. Microwave safe.',                     14.99, 100, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600', 'Kitchen'),
  (7,  'Bluetooth Speaker',         'Waterproof IPX7 speaker, 360-degree sound, 12hr battery.',           49.99,  35, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600', 'Electronics'),
  (8,  'Leather Wallet',            'Slim genuine leather bifold wallet with RFID blocking.',              34.99,  50, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', 'Accessories'),
  (9,  'Sunglasses',                'UV400 polarized sunglasses with lightweight frame.',                  39.99,  45, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', 'Accessories'),
  (10, 'Water Bottle',              'Insulated stainless steel bottle, keeps cold 24hr.',                 24.99,  70, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600', 'Sports');