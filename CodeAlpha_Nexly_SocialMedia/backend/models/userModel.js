const db = require("../config/db");

const userModel = {
  async findByEmail(email) {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },
  async findById(id) {
    const result = await db.query(
      `SELECT id, username, email, display_name, bio, avatar_url,
              is_active, is_verified, created_at FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  },
  async findByUsername(username) {
    const result = await db.query(
      `SELECT id, username, email, display_name, bio, avatar_url,
              is_active, is_verified, created_at FROM users WHERE username = $1`,
      [username],
    );
    return result.rows[0];
  },
  async create({ username, email, passwordHash, displayName }) {
    const result = await db.query(
      `INSERT INTO users (username, email, password_hash, display_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, display_name, created_at`,
      [username, email, passwordHash, displayName || username],
    );
    return result.rows[0];
  },
  async update(id, { display_name, bio, avatar_url, website, location }) {
    const fields = [],
      values = [];
    let i = 1;
    if (display_name !== undefined) {
      fields.push(`display_name=$${i++}`);
      values.push(display_name);
    }
    if (bio !== undefined) {
      fields.push(`bio=$${i++}`);
      values.push(bio);
    }
    if (avatar_url !== undefined) {
      fields.push(`avatar_url=$${i++}`);
      values.push(avatar_url);
    }
    if (website !== undefined) {
      fields.push(`website=$${i++}`);
      values.push(website);
    }
    if (location !== undefined) {
      fields.push(`location=$${i++}`);
      values.push(location);
    }
    if (!fields.length) return null;
    fields.push(`updated_at=NOW()`);
    values.push(id);
    const result = await db.query(
      `UPDATE users SET ${fields.join(",")} WHERE id=$${i}
       RETURNING id, username, email, display_name, bio, avatar_url, is_verified`,
      values,
    );
    return result.rows[0];
  },
  async getStats(userId) {
    const result = await db.query(
      `SELECT
        (SELECT COUNT(*) FROM posts   WHERE user_id=$1)::int      AS posts_count,
        (SELECT COUNT(*) FROM follows WHERE following_id=$1)::int AS followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id=$1)::int  AS following_count`,
      [userId],
    );
    return result.rows[0];
  },
  async search(q) {
    const result = await db.query(
      `SELECT id, username, display_name, avatar_url, bio
       FROM users WHERE username ILIKE $1 OR display_name ILIKE $1 LIMIT 20`,
      [`%${q}%`],
    );
    return result.rows;
  },
};

module.exports = userModel;
