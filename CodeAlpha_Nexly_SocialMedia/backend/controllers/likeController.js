const likeModel = require("../models/likeModel");

const togglePostLike = async (req, res, next) => {
  try {
    const result = await likeModel.togglePostLike(
      req.user.id,
      req.params.postId,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const toggleCommentLike = async (req, res, next) => {
  try {
    const result = await likeModel.toggleCommentLike(
      req.user.id,
      req.params.commentId,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getPostLikers = async (req, res, next) => {
  try {
    const users = await likeModel.getPostLikers(req.params.postId);
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

module.exports = { togglePostLike, toggleCommentLike, getPostLikers };
