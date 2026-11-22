-- Migration 0010: Claim pubblicitari DM (art. 26 D.Lgs. 137/2022) - testi a tre versioni + stato replicato dal CRM.
-- SOLO strutture: nessun testo viene inserito qui (il seeding e' uno script separato, vedi docs/claim-dm).
-- Il selettore dello STATO vive nel CRM TeleMedCare; qui c'e' soltanto la replica (stato_replicato).

CREATE TABLE IF NOT EXISTS claim_blocks (
  block_id TEXT PRIMARY KEY,                 -- EC-01 ... (estensibile: EC-12, ...)
  titolo TEXT NOT NULL DEFAULT '',           -- etichetta per l'elenco admin
  pagine TEXT NOT NULL DEFAULT '[]',         -- JSON: path che renderizzano il blocco (usati dal purge)
  stato_replicato TEXT CHECK (stato_replicato IN ('ORIGINALE','TRANSITORIA','AUTORIZZATA')),  -- NULL = mai sincronizzato
  stato_replicato_at TEXT,                   -- ISO UTC: ultima conferma ricevuta dal CRM (webhook o riconciliazione)
  stato_crm_updated_at TEXT,                 -- ISO UTC: updated_at dello stato lato CRM (ordinamento anti-evento-vecchio)
  stato_motivo TEXT,
  versione_originale TEXT NOT NULL DEFAULT '',
  versione_originale_estratta_at TEXT,       -- timestamp dello snapshot live da cui deriva
  versione_transitoria TEXT NOT NULL DEFAULT '',   -- vuoto = blocco rimosso in transito
  versione_autorizzata TEXT,                 -- NULL finche' non c'e' il provvedimento
  numero_provvedimento TEXT,
  data_autorizzazione TEXT,                  -- YYYY-MM-DD
  updated_by TEXT,
  updated_at TEXT,
  motivo TEXT
);

-- Revisioni immutabili: ogni salvataggio / ripristino di un campo testo o provvedimento.
CREATE TABLE IF NOT EXISTS claim_blocks_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  block_id TEXT NOT NULL,
  campo TEXT NOT NULL,
  testo_precedente TEXT,
  testo_nuovo TEXT,
  autore TEXT NOT NULL,
  creato_at TEXT NOT NULL,
  motivo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'modifica',    -- modifica | ripristino | seed
  ripristina_revisione_id INTEGER
);
CREATE INDEX IF NOT EXISTS idx_claim_rev_block ON claim_blocks_revisions (block_id, id DESC);

-- Configurazione e telemetria di sincronizzazione (chiave/valore).
CREATE TABLE IF NOT EXISTS claim_config (
  chiave TEXT PRIMARY KEY,
  valore TEXT,
  updated_at TEXT
);
INSERT OR IGNORE INTO claim_config (chiave, valore) VALUES
  ('require_provvedimento_for_autorizzata', 'false'),
  ('freschezza_ore', '24'),
  ('riconciliazione_minuti', '15');

-- Registro dei webhook ricevuti dal CRM (diagnostica; i cambi di stato "ufficiali" sono nel log del CRM).
CREATE TABLE IF NOT EXISTS claim_sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ricevuto_at TEXT NOT NULL,
  origine TEXT NOT NULL,                    -- webhook | riconciliazione
  block_id TEXT,
  stato TEXT,
  motivo TEXT,
  esito TEXT NOT NULL                       -- applicato | invariato | obsoleto | rifiutato
);
