const db = require("../config/db");

const commentModel = {
  async getByPost(postId) {
    const result = await db.query(
      `SELECT c.*, u.username, u.display_name, u.avatar_url,
              COUNT(DISTINCT l.id)::int AS like_count
       FROM comments c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN likes l ON l.comment_id = c.id
       WHERE c.post_id = $1 AND c.parent_id IS NULL
       GROUP BY c.id, u.username, u.display_name, u.avatar_url
       ORDER BY c.created_at ASC`,
      [postId],
    );
    return result.rows;
  },

  async getReplies(commentId) {
    const result = await db.query(
      `SELECT c.*, u.username, u.display_name, u.avatar_url
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.parent_id = $1
       ORDER BY c.created_at ASC`,
      [commentId],
    );
    return result.rows;
  },

  async create({ post_id, user_id, content, parent_id }) {
    const result = await db.query(
      `INSERT INTO comments (post_id, user_id, content, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [post_id, user_id, content, parent_id || null],
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await db.query("SELECT * FROM comments WHERE id = $1", [id]);
    return result.rows[0];
  },

  async delete(id) {
    await db.query("DELETE FROM comments WHERE id = $1", [id]);
  },
};

module.exports = commentModel;
