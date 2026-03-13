const db = require("../config/db");

const postModel = {
  async create({ user_id, content, image_url }) {
    const result = await db.query(
      `INSERT INTO posts (user_id, content, image_url)
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, content, image_url || null],
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await db.query(
      `SELECT p.*, u.username, u.display_name, u.avatar_url,
              COUNT(DISTINCT l.id)::int AS like_count,
              COUNT(DISTINCT c.id)::int AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN likes l ON l.post_id = p.id
       LEFT JOIN comments c ON c.post_id = p.id
       WHERE p.id = $1
       GROUP BY p.id, u.username, u.display_name, u.avatar_url`,
      [id],
    );
    return result.rows[0];
  },

  async getFeed(userId) {
    const result = await db.query(
      `SELECT p.*, u.username, u.display_name, u.avatar_url,
              COUNT(DISTINCT l.id)::int  AS like_count,
              COUNT(DISTINCT c.id)::int  AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN likes l ON l.post_id = p.id
       LEFT JOIN comments c ON c.post_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id, u.username, u.display_name, u.avatar_url
       ORDER BY p.created_at DESC`,
      [userId],
    );
    return result.rows;
  },

  async getByUser(userId) {
    const result = await db.query(
      `SELECT p.*, u.username, u.display_name, u.avatar_url,
              COUNT(DISTINCT l.id)::int AS like_count,
              COUNT(DISTINCT c.id)::int AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN likes l ON l.post_id = p.id
       LEFT JOIN comments c ON c.post_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id, u.username, u.display_name, u.avatar_url
       ORDER BY p.created_at DESC`,
      [userId],
    );
    return result.rows;
  },

  async getByUsername(username) {
    const result = await db.query(
      `SELECT p.*, u.username, u.display_name, u.avatar_url,
              COUNT(DISTINCT l.id)::int AS like_count,
              COUNT(DISTINCT c.id)::int AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN likes l ON l.post_id = p.id
       LEFT JOIN comments c ON c.post_id = p.id
       WHERE u.username = $1
       GROUP BY p.id, u.username, u.display_name, u.avatar_url
       ORDER BY p.created_at DESC`,
      [username],
    );
    return result.rows;
  },

  async update(id, { content, image_url }) {
    const result = await db.query(
      `UPDATE posts SET content = $1, image_url = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [content, image_url, id],
    );
    return result.rows[0];
  },

  async delete(id) {
    await db.query("DELETE FROM posts WHERE id = $1", [id]);
  },
};

module.exports = postModel;
