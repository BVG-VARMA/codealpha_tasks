const express = require("express");
const router = express.Router({ mergeParams: true });
const protect = require("../middleware/auth");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.use(protect);
router.route("/").get(getTasks).post(createTask);
router.route("/:taskId").put(updateTask).delete(deleteTask);

module.exports = router;
