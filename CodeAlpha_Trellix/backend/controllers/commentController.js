const Comment = require("../models/Comment");

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate("author", "name email")
      .sort("createdAt")
      .lean();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ message: "Comment text required" });

    const comment = await Comment.create({
      text,
      task: req.params.taskId,
      author: req.user.id,
    });
    const populated = await Comment.findById(comment._id)
      .populate("author", "name email")
      .lean();

    req.io.to(req.params.projectId).emit("commentAdded", populated);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.commentId,
      author: req.user.id,
    });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    req.io
      .to(req.params.projectId)
      .emit("commentDeleted", { commentId: req.params.commentId });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getComments, addComment, deleteComment };
