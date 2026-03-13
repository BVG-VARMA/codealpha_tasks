CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS posts (
  id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id  UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT         NOT NULL,
  image_url  VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP    DEFAULT NOW(),
  updated_at TIMESTAMP    DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);