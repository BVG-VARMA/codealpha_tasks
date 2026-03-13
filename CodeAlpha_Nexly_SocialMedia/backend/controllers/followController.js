const followModel = require("../models/followModel");
const UserModel = require("../models/userModel");

const toggleFollow = async (req, res, next) => {
  try {
    const target = await UserModel.findByUsername(req.params.username);
    if (!target) return res.status(404).json({ message: "User not found." });
    if (target.id === req.user.id)
      return res.status(400).json({ message: "Cannot follow yourself." });
    const result = await followModel.toggleFollow(req.user.id, target.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleFollow };
