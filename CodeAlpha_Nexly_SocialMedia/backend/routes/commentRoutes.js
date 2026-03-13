const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getComments,
  getReplies,
  createComment,
  deleteComment,
} = require("../controllers/commentController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

router.get("/posts/:postId/comments", optionalAuth, getComments);
router.get("/comments/:commentId/replies", optionalAuth, getReplies);
router.post("/posts/:postId/comments", protect, createComment);
router.delete("/comments/:id", protect, deleteComment);

module.exports = router;
