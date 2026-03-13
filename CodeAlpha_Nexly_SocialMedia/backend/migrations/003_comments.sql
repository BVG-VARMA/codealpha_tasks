CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS comments (
  id         UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID      NOT NULL REFERENCES posts(id)    ON DELETE CASCADE,
  author_id  UUID      NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  parent_id  UUID               REFERENCES comments(id) ON DELETE CASCADE,
  body       TEXT      NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);