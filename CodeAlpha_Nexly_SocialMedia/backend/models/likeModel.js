const db = require("../config/db");

const likeModel = {
  async togglePostLike(userId, postId) {
    const existing = await db.query(
      "SELECT id FROM likes WHERE user_id = $1 AND post_id = $2",
      [userId, postId],
    );
    if (existing.rows.length) {
      await db.query("DELETE FROM likes WHERE user_id = $1 AND post_id = $2", [
        userId,
        postId,
      ]);
      const count = await db.query(
        "SELECT COUNT(*)::int FROM likes WHERE post_id = $1",
        [postId],
      );
      return { liked: false, like_count: count.rows[0].count };
    } else {
      await db.query("INSERT INTO likes (user_id, post_id) VALUES ($1, $2)", [
        userId,
        postId,
      ]);
      const count = await db.query(
        "SELECT COUNT(*)::int FROM likes WHERE post_id = $1",
        [postId],
      );
      return { liked: true, like_count: count.rows[0].count };
    }
  },

  async toggleCommentLike(userId, commentId) {
    const existing = await db.query(
      "SELECT id FROM likes WHERE user_id = $1 AND comment_id = $2",
      [userId, commentId],
    );
    if (existing.rows.length) {
      await db.query(
        "DELETE FROM likes WHERE user_id = $1 AND comment_id = $2",
        [userId, commentId],
      );
      return { liked: false };
    } else {
      await db.query(
        "INSERT INTO likes (user_id, comment_id) VALUES ($1, $2)",
        [userId, commentId],
      );
      return { liked: true };
    }
  },

  // ── NEW: get list of users who liked a post ──────────
  async getPostLikers(postId) {
    const result = await db.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url
       FROM likes l
       JOIN users u ON u.id = l.user_id
       WHERE l.post_id = $1
       ORDER BY l.created_at DESC
       LIMIT 100`,
      [postId],
    );
    return result.rows;
  },
};

module.exports = likeModel;
