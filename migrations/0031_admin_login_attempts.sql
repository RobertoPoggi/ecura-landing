-- Rate limiting dei tentativi di login falliti (area admin)
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  username TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_ip ON admin_login_attempts (ip, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_user ON admin_login_attempts (username, created_at);
