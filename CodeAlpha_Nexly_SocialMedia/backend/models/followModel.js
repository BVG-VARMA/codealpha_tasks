const db = require("../config/db");

const followModel = {
  async toggleFollow(followerId, followingId) {
    const existing = await db.query(
      "SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2",
      [followerId, followingId],
    );
    if (existing.rows.length) {
      await db.query(
        "DELETE FROM follows WHERE follower_id = $1 AND following_id = $2",
        [followerId, followingId],
      );
      return { following: false };
    } else {
      await db.query(
        "INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)",
        [followerId, followingId],
      );
      return { following: true };
    }
  },

  async isFollowing(followerId, followingId) {
    const result = await db.query(
      "SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2",
      [followerId, followingId],
    );
    return result.rows.length > 0;
  },

  async getFollowers(userId, page = 1) {
    const limit = 20;
    const offset = (page - 1) * limit;
    const result = await db.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url
       FROM follows f
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    return result.rows;
  },

  async getFollowing(userId, page = 1) {
    const limit = 20;
    const offset = (page - 1) * limit;
    const result = await db.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url
       FROM follows f
       JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    return result.rows;
  },
};

module.exports = followModel;
