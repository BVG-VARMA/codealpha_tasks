CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS likes (
  id         UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id    UUID      NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_like UNIQUE (user_id, post_id)
);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);