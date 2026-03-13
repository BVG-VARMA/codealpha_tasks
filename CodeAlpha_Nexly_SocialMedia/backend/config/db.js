const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL connected successfully");
    client.release();
  } catch (err) {
    console.error(" PostgreSQL connection error:", err.message);
    process.exit(1);
  }
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development") {
      console.log("Query executed", {
        text: text.substring(0, 50),
        duration,
        rows: res.rowCount,
      });
    }
    return res;
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  }
};

module.exports = { pool, query, testConnection };
