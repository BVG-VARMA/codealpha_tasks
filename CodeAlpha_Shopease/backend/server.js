require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

require("./db/database");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use(
  "/images",
  express.static(path.join(__dirname, "..", "frontend", "images")),
);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin", require("./routes/admin"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🛒  ShopEase running → http://localhost:${PORT}`);
});
