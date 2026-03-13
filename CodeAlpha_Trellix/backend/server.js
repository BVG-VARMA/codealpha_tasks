const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const initSocket = require("./socket/socket");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json({ limit: "1mb" }));

// Attach socket.io to every request
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/projects/:projectId/tasks", require("./routes/taskRoutes"));
app.use(
  "/api/projects/:projectId/tasks/:taskId/comments",
  require("./routes/commentRoutes"),
);

app.get("/api/health", (_req, res) =>
  res.json({ status: "OK", message: "Trellix API running" }),
);

// ── Error handlers ───────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
