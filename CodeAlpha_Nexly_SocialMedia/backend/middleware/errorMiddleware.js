const errorMiddleware = (err, req, res, next) => {
  console.error("Unhandled error:", err);

  // PostgreSQL unique violation
  if (err.code === "23505") {
    const field = err.detail?.match(/Key \((.+)\)/)?.[1] || "field";
    return res.status(409).json({ message: `${field} already exists` });
  }

  // PostgreSQL foreign key violation
  if (err.code === "23503") {
    return res
      .status(400)
      .json({ message: "Referenced resource does not exist" });
  }

  // PostgreSQL check constraint violation
  if (err.code === "23514") {
    return res.status(400).json({ message: "Constraint violation" });
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ message: "File size too large. Maximum 5MB allowed." });
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(statusCode).json({ message });
};

module.exports = errorMiddleware;
