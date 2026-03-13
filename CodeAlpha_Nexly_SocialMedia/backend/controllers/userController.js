const UserModel = require("../models/userModel");
const FollowModel = require("../models/followModel");

const getProfile = async (req, res) => {
  try {
    const user = await UserModel.findByUsername(req.params.username);
    if (!user) return res.status(404).json({ message: "User not found" });

    const stats = await UserModel.getStats(user.id);
    let isFollowing = false;
    if (req.user) {
      isFollowing = await FollowModel.isFollowing(req.user.id, user.id);
    }

    res.json({ user: { ...user, ...stats, isFollowing } });
  } catch (err) {
    console.error("GetProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { displayName, bio, website, location } = req.body;
    const avatarUrl = req.file
      ? `/uploads/avatars/${req.file.filename}`
      : undefined;

    const updated = await UserModel.update(req.user.id, {
      display_name: displayName,
      bio,
      website,
      location,
      ...(avatarUrl && { avatar_url: avatarUrl }),
    });

    if (!updated) return res.status(400).json({ message: "Nothing to update" });
    res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    console.error("UpdateProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Search query must be at least 2 characters" });
    }
    const users = await UserModel.search(q.trim());
    res.json({ users });
  } catch (err) {
    console.error("SearchUsers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getFollowers = async (req, res) => {
  try {
    const user = await UserModel.findByUsername(req.params.username);
    if (!user) return res.status(404).json({ message: "User not found" });
    const page = parseInt(req.query.page) || 1;
    const followers = await FollowModel.getFollowers(user.id, page);
    res.json({ followers });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getFollowing = async (req, res) => {
  try {
    const user = await UserModel.findByUsername(req.params.username);
    if (!user) return res.status(404).json({ message: "User not found" });
    const page = parseInt(req.query.page) || 1;
    const following = await FollowModel.getFollowing(user.id, page);
    res.json({ following });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  searchUsers,
  getFollowers,
  getFollowing,
};
