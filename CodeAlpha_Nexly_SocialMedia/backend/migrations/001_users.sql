CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  username   VARCHAR(30)  UNIQUE NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  bio        TEXT         DEFAULT '',
  avatar_url VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP    DEFAULT NOW(),
  updated_at TIMESTAMP    DEFAULT NOW()
);