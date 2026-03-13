const express = require("express");
const router = express.Router();
const { toggleFollow } = require("../controllers/followController");
const { protect } = require("../middleware/authMiddleware");

router.post("/:username/follow", protect, toggleFollow);

module.exports = router;
