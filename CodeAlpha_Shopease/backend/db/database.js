const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_FILE = path.join(__dirname, "database.sqlite");

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error("❌ DB error:", err.message);
    process.exit(1);
  }
  console.log("✅ SQLite connected →", DB_FILE);
  initDB();
});

function initDB() {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
    (err) => {
      if (err) console.error("users table error:", err.message);
      else console.log("✅ users table ready");
    },
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    category TEXT NOT NULL DEFAULT 'General'
  )`,
    (err) => {
      if (err) console.error("products table error:", err.message);
      else {
        console.log("✅ products table ready");
        seedProducts();
      }
    },
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE(user_id, product_id)
  )`,
    (err) => {
      if (err) console.error("cart_items table error:", err.message);
      else console.log("✅ cart_items table ready");
    },
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
    (err) => {
      if (err) console.error("orders table error:", err.message);
      else console.log("✅ orders table ready");
    },
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL
  )`,
    (err) => {
      if (err) console.error("order_items table error:", err.message);
      else console.log("✅ order_items table ready");
    },
  );
}

function seedProducts() {
  const products = [
    // ── Electronics ──────────────────────────────────────
    [
      1,
      "Wireless Headphones",
      "Premium noise-cancelling over-ear headphones, 30hr battery.",
      2999,
      25,
      "/images/headphones.png",
      "Electronics",
    ],
    [
      2,
      "Mechanical Keyboard",
      "Compact TKL RGB keyboard with tactile switches.",
      1999,
      40,
      "/images/keyboard.png",
      "Electronics",
    ],
    [
      3,
      "Bluetooth Speaker",
      "Waterproof IPX7 speaker, 360-degree sound, 12hr battery.",
      1499,
      35,
      "/images/speaker.png",
      "Electronics",
    ],
    [
      4,
      "Smart Watch",
      "Fitness tracker with heart rate monitor and AMOLED display.",
      3499,
      20,
      "/images/smartwatch.png",
      "Electronics",
    ],
    [
      5,
      "Wireless Earbuds",
      "True wireless earbuds with active noise cancellation.",
      1799,
      50,
      "/images/earbuds.png",
      "Electronics",
    ],

    // ── Fashion ───────────────────────────────────────────
    [
      6,
      "Men Cotton T-Shirt",
      "Premium 100% cotton round neck t-shirt, available in all sizes.",
      499,
      100,
      "/images/tshirt.png",
      "Fashion",
    ],
    [
      7,
      "Women Kurti",
      "Beautiful printed cotton kurti, perfect for daily wear.",
      799,
      80,
      "/images/kurti.png",
      "Fashion",
    ],
    [
      8,
      "Denim Jeans",
      "Slim fit stretchable denim jeans for men.",
      1299,
      60,
      "/images/jeans.png",
      "Fashion",
    ],
    [
      9,
      "Men Formal Shirt",
      "Premium wrinkle-free formal shirt for office wear.",
      899,
      70,
      "/images/formalshirt.png",
      "Fashion",
    ],
    [
      10,
      "Women Jacket",
      "Stylish quilted jacket, warm and lightweight.",
      1599,
      45,
      "/images/jacket.png",
      "Fashion",
    ],

    // ── Footwear ──────────────────────────────────────────
    [
      11,
      "Running Shoes",
      "Lightweight breathable shoes with cushioned sole.",
      999,
      60,
      "/images/runningshoes.png",
      "Footwear",
    ],
    [
      12,
      "Casual Sneakers",
      "Trendy canvas sneakers for everyday casual wear.",
      799,
      55,
      "/images/sneakers.png",
      "Footwear",
    ],
    [
      13,
      "Men Leather Sandals",
      "Durable genuine leather sandals with cushioned footbed.",
      599,
      40,
      "/images/sandals.png",
      "Footwear",
    ],
    [
      14,
      "Women Heels",
      "Elegant block heels perfect for parties and events.",
      999,
      30,
      "/images/heels.png",
      "Footwear",
    ],

    // ── Accessories ───────────────────────────────────────
    [
      15,
      "Leather Wallet",
      "Slim genuine leather bifold wallet with RFID blocking.",
      699,
      50,
      "/images/wallet.png",
      "Accessories",
    ],
    [
      16,
      "Sunglasses",
      "UV400 polarized sunglasses with lightweight frame.",
      599,
      45,
      "/images/sunglasses.png",
      "Accessories",
    ],
    [
      17,
      "Canvas Backpack",
      "20L waterproof canvas backpack with laptop compartment.",
      1299,
      35,
      "/images/backpack.png",
      "Accessories",
    ],
    [
      18,
      "Men Belt",
      "Genuine leather reversible belt with silver buckle.",
      499,
      60,
      "/images/belt.png",
      "Accessories",
    ],

    // ── Home & Living ─────────────────────────────────────
    [
      19,
      "Table Lamp",
      "Modern minimalist LED table lamp with touch dimmer.",
      1199,
      25,
      "/images/tablelamp.png",
      "Home & Living",
    ],
    [
      20,
      "Throw Pillow Set",
      "Set of 2 soft velvet decorative cushion covers.",
      599,
      40,
      "/images/pillowset.png",
      "Home & Living",
    ],
    [
      21,
      "Scented Candle",
      "Luxury soy wax candle with sandalwood fragrance, 40hr burn.",
      399,
      80,
      "/images/candle.png",
      "Home & Living",
    ],
    [
      22,
      "Wall Clock",
      "Silent sweep mechanism wooden wall clock, 30cm diameter.",
      899,
      30,
      "/images/wallclock.png",
      "Home & Living",
    ],

    // ── Beauty ────────────────────────────────────────────
    [
      23,
      "Vitamin C Serum",
      "Brightening vitamin C face serum with hyaluronic acid.",
      799,
      60,
      "/images/serum.png",
      "Beauty",
    ],
    [
      24,
      "Perfume",
      "Long-lasting floral woody fragrance for women, 50ml.",
      1499,
      30,
      "/images/perfume.png",
      "Beauty",
    ],
    [
      25,
      "Face Wash",
      "Gentle foaming face wash with neem and turmeric.",
      299,
      100,
      "/images/facewash.png",
      "Beauty",
    ],
    [
      26,
      "Lipstick Set",
      "Set of 5 long-stay matte lipsticks in trending shades.",
      699,
      50,
      "/images/lipstick.png",
      "Beauty",
    ],

    // ── Sports ────────────────────────────────────────────
    [
      27,
      "Yoga Mat",
      "Non-slip eco-friendly 6mm mat with carrying strap.",
      899,
      80,
      "/images/yogamat.png",
      "Sports",
    ],
    [
      28,
      "Dumbbell Set",
      "Pair of 5kg rubber coated dumbbells for home workout.",
      1999,
      25,
      "/images/dumbbells.png",
      "Sports",
    ],
    [
      29,
      "Water Bottle",
      "Insulated stainless steel bottle, keeps cold 24hr.",
      599,
      70,
      "/images/waterbottle.png",
      "Sports",
    ],
    [
      30,
      "Resistance Bands Set",
      "Set of 5 resistance bands with handles for full body workout.",
      799,
      40,
      "/images/resistancebands.png",
      "Sports",
    ],

    // ── Books ─────────────────────────────────────────────
    [
      31,
      "Atomic Habits",
      "James Clear — Build good habits and break bad ones.",
      499,
      50,
      "/images/atomichabits.png",
      "Books",
    ],
    [
      32,
      "The Alchemist",
      "Paulo Coelho — A magical story about following your dreams.",
      299,
      60,
      "/images/alchemist.png",
      "Books",
    ],
    [
      33,
      "Rich Dad Poor Dad",
      "Robert Kiyosaki — Personal finance and investment classic.",
      349,
      45,
      "/images/richdadpoordad.png",
      "Books",
    ],

    // ── Toys ──────────────────────────────────────────────
    [
      34,
      "Lego Classic Set",
      "500-piece classic LEGO building blocks set for all ages.",
      1299,
      20,
      "/images/lego.png",
      "Toys",
    ],
    [
      35,
      "Carrom Board",
      "Full size premium carrom board with coins and striker.",
      1499,
      15,
      "/images/carrom.png",
      "Toys",
    ],
    [
      36,
      "Rubiks Cube",
      "Original 3x3 speed cube with smooth corner cutting.",
      299,
      80,
      "/images/rubikscube.png",
      "Toys",
    ],

    // ── Kitchen ───────────────────────────────────────────
    [
      37,
      "Ceramic Coffee Mug",
      "Handcrafted 350ml ceramic mug. Microwave safe.",
      349,
      100,
      "/images/mug.png",
      "Kitchen",
    ],
    [
      38,
      "Non-stick Frying Pan",
      "24cm granite coated non-stick frying pan with glass lid.",
      1299,
      30,
      "/images/fryingpan.png",
      "Kitchen",
    ],
    [
      39,
      "Stainless Steel Tiffin",
      "3-tier leak-proof stainless steel lunch box.",
      699,
      50,
      "/images/tiffin.png",
      "Kitchen",
    ],
    [
      40,
      "Electric Kettle",
      "1.5L stainless steel electric kettle with auto shut-off.",
      999,
      40,
      "/images/kettle.png",
      "Kitchen",
    ],
  ];

  products.forEach((p) => {
    db.run(
      `INSERT OR IGNORE INTO products (id, name, description, price, stock, image_url, category) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      p,
      (err) => {
        if (err) console.error("Seed error:", err.message);
      },
    );
  });
  console.log("✅ 40 products seeded");
}

db.getAsync = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row))),
  );

db.allAsync = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))),
  );

db.runAsync = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    }),
  );

db.runTransaction = async (steps) => {
  await db.runAsync("BEGIN");
  try {
    const result = await steps();
    await db.runAsync("COMMIT");
    return result;
  } catch (err) {
    await db.runAsync("ROLLBACK").catch(() => {});
    throw err;
  }
};

module.exports = db;
