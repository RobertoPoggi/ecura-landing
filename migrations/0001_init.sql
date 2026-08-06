-- Migration 0001: Initial schema for ecura-landing admin

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT
);

-- Blog articles table
CREATE TABLE IF NOT EXISTS blog_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Informazione',
  tag_color TEXT DEFAULT '#068D86',
  author TEXT DEFAULT 'Redazione eCura',
  date_published TEXT NOT NULL,
  date_modified TEXT,
  read_time TEXT DEFAULT '5 min lettura',
  hero_image TEXT DEFAULT '/img/blog/default.jpg',
  hero_image_alt TEXT DEFAULT '',
  summary TEXT,
  content TEXT NOT NULL,
  related_1_slug TEXT,
  related_1_title TEXT,
  related_1_excerpt TEXT,
  related_1_tag TEXT,
  related_2_slug TEXT,
  related_2_title TEXT,
  related_2_excerpt TEXT,
  related_2_tag TEXT,
  related_3_slug TEXT,
  related_3_title TEXT,
  related_3_excerpt TEXT,
  related_3_tag TEXT,
  status TEXT DEFAULT 'published',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Insert default admin user (password will be set via /admin/setup)
INSERT OR IGNORE INTO admin_users (username, password_hash)
VALUES ('admin', '__PENDING_SETUP__');
