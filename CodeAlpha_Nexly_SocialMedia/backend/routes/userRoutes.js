const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  searchUsers,
  getFollowers,
  getFollowing,
} = require("../controllers/userController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const { uploadAvatar } = require("../middleware/uploadMiddleware");

router.get("/search", searchUsers);
router.get("/:username", optionalAuth, getProfile);
router.put("/me/profile", protect, uploadAvatar, updateProfile);
router.get("/:username/followers", getFollowers);
router.get("/:username/following", getFollowing);

module.exports = router;
