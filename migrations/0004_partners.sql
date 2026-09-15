-- Migration 0004: Partners program table
-- Registra i partner del programma referral eCura

CREATE TABLE IF NOT EXISTS partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Dati anagrafici
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  phone       TEXT NOT NULL,
  role        TEXT NOT NULL,          -- Fisioterapista | Badante | Farmacia | RSA | Medico | Assistente Sociale | Altro
  city        TEXT,
  message     TEXT,                   -- "Come pensi di promuovere eCura?"

  -- Codice referral univoco generato al momento della registrazione
  -- Formato: ECU-XXXX (es. ECU-A3F7) — 4 caratteri alfanumerici uppercase
  referral_code TEXT UNIQUE,

  -- Link tracciato completo (precompilato)
  referral_url  TEXT,                 -- https://www.ecura.it/?ref=ECU-A3F7

  -- Stato della partnership
  status TEXT DEFAULT 'pending',     -- pending | approved | rejected | suspended

  -- Commissioni configurate
  commission_pct REAL DEFAULT 5.0,   -- % commissione (5.0 | 7.0 | 10.0)

  -- Contatori
  referrals_count  INTEGER DEFAULT 0,  -- clienti referral totali
  referrals_active INTEGER DEFAULT 0,  -- clienti attivi (abbonamento in corso)

  -- Privacy
  privacy_consent INTEGER NOT NULL DEFAULT 0,  -- 1 = accettata

  -- Tracking
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  page_url     TEXT,
  referrer     TEXT,

  -- Timestamps
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now')),
  approved_at TEXT
);

-- Indici per lookup veloci
CREATE INDEX IF NOT EXISTS idx_partners_email         ON partners(email);
CREATE INDEX IF NOT EXISTS idx_partners_referral_code ON partners(referral_code);
CREATE INDEX IF NOT EXISTS idx_partners_status        ON partners(status);
