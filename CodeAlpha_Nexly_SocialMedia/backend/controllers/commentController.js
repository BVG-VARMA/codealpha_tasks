const commentModel = require("../models/commentModel");

const getComments = async (req, res, next) => {
  try {
    const comments = await commentModel.getByPost(req.params.postId);
    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

const getReplies = async (req, res, next) => {
  try {
    const replies = await commentModel.getReplies(req.params.commentId);
    res.json({ replies });
  } catch (err) {
    next(err);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { body, parent_id } = req.body;
    if (!body)
      return res.status(400).json({ message: "Comment body is required." });
    const comment = await commentModel.create({
      post_id: req.params.postId,
      user_id: req.user.id,
      content: body,
      parent_id: parent_id || null,
    });
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await commentModel.findById(req.params.id);
    if (!comment)
      return res.status(404).json({ message: "Comment not found." });
    if (comment.user_id !== req.user.id)
      return res.status(403).json({ message: "Not authorized." });
    await commentModel.delete(req.params.id);
    res.json({ message: "Comment deleted." });
  } catch (err) {
    next(err);
  }
};

module.exports = { getComments, getReplies, createComment, deleteComment };
