CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS follows (
  id           UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id  UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_follow  UNIQUE (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK  (follower_id <> following_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_follower  ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);