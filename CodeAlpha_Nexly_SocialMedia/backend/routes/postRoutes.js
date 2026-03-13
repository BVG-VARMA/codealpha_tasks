const express = require("express");
const router = express.Router();
const {
  getFeed,
  getPost,
  getUserPosts,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { uploadPostImage } = require("../middleware/uploadMiddleware");

router.get("/feed", protect, getFeed);
router.get("/user/:username", optionalAuth, getUserPosts);
router.get("/:id", optionalAuth, getPost);
router.post("/", protect, uploadPostImage, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;
