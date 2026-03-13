const express = require("express");
const router = express.Router();
const {
  togglePostLike,
  toggleCommentLike,
  getPostLikers,
} = require("../controllers/likeController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

router.post("/posts/:postId/like", protect, togglePostLike);
router.post("/comments/:commentId/like", protect, toggleCommentLike);
router.get("/posts/:postId/likers", optionalAuth, getPostLikers); // ← NEW

module.exports = router;
