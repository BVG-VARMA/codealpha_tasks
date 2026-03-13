const postModel = require("../models/postModel");

const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content)
      return res.status(400).json({ message: "Content is required." });
    const image_url = req.file ? `/uploads/posts/${req.file.filename}` : null;
    const post = await postModel.create({
      user_id: req.user.id,
      content,
      image_url,
    });
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
};

const getFeed = async (req, res, next) => {
  try {
    const posts = await postModel.getFeed(req.user.id);
    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    res.json({ post });
  } catch (err) {
    next(err);
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const posts = await postModel.getByUsername(req.params.username);
    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (post.user_id !== req.user.id)
      return res.status(403).json({ message: "Not authorized." });
    const { content } = req.body;
    const image_url = req.file
      ? `/uploads/posts/${req.file.filename}`
      : post.image_url;
    const updated = await postModel.update(req.params.id, {
      content,
      image_url,
    });
    res.json({ post: updated });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (post.user_id !== req.user.id)
      return res.status(403).json({ message: "Not authorized." });
    await postModel.delete(req.params.id);
    res.json({ message: "Post deleted." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPost,
  getFeed,
  getPost,
  getUserPosts,
  updatePost,
  deletePost,
};
