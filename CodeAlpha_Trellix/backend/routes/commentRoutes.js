const express = require("express");
const router = express.Router({ mergeParams: true });
const protect = require("../middleware/auth");
const {
  getComments,
  addComment,
  deleteComment,
} = require("../controllers/commentController");

router.use(protect);
router.route("/").get(getComments).post(addComment);
router.route("/:commentId").delete(deleteComment);

module.exports = router;
