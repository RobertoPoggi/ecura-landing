/**
 * Claim pubblicitari DM (art. 26 D.Lgs. 137/2022) - logica condivisa.
 * Questo file non esporta onRequest*, quindi non genera route.
 *
 * Ripartizione: lo STATO dei blocchi e' deciso nel CRM TeleMedCare e replicato qui (stato_replicato);
 * i TESTI delle tre versioni vivono solo in D1 e si modificano solo da /admin/dashboard.
 * Il render legge SOLO D1. Nessuna di queste funzioni gira nel browser.
 *
 * Nessun testo di claim o di autorizzazione e' scritto in questo file: tutto arriva da D1.
 */

export const STATI = ['ORIGINALE', 'TRANSITORIA', 'AUTORIZZATA'];
export const CAMPI_TESTO = ['versione_originale', 'versione_transitoria', 'versione_autorizzata', 'numero_provvedimento', 'data_autorizzazione'];
export const BLOCK_ID_RE = /^EC-\d{2}$/;
export const SOGLIA_ALERT_MINUTI = 15;
const FRESCHEZZA_ORE_DEFAULT = 24;

const isIso = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(s) && !Number.isNaN(Date.parse(s));
const nonVuoto = s => typeof s === 'string' && s.trim() !== '';

/** Confronto a tempo costante (per i token server-to-server). */
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** Autenticazione server-to-server: serve CLAIM_SYNC_TOKEN configurato; mai ripiego su altro. */
export function checkServerToken(request, env) {
  const atteso = env && env.CLAIM_SYNC_TOKEN;
  if (!nonVuoto(atteso)) return { ok: false, status: 503, error: 'CLAIM_SYNC_TOKEN non configurato' };
  const h = request.headers.get('Authorization') || '';
  const m = /^Bearer (.+)$/.exec(h);
  if (!m || !timingSafeEqual(m[1], atteso)) return { ok: false, status: 401, error: 'Non autorizzato' };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Configurazione
// ---------------------------------------------------------------------------
export async function leggiConfig(db) {
  const cfg = {};
  try {
    const { results } = await db.prepare('SELECT chiave, valore FROM claim_config').all();
    for (const r of results || []) cfg[r.chiave] = r.valore;
  } catch { /* tabella assente: default prudenti sotto */ }
  return {
    requireProvvedimento: String(cfg.require_provvedimento_for_autorizzata || 'false').toLowerCase() === 'true',
    freschezzaOre: Number(cfg.freschezza_ore) > 0 ? Number(cfg.freschezza_ore) : FRESCHEZZA_ORE_DEFAULT,
    formatoRiferimento: cfg.formato_riferimento_autorizzazione || '',
    raw: cfg,
  };
}

// ---------------------------------------------------------------------------
// Render: stato effettivo + catena di fallback (REGOLA CRITICA)
// ---------------------------------------------------------------------------
/** true se la replica dello stato e' mancante o piu' vecchia della soglia di freschezza. */
export function replicaStale(row, now, freschezzaOre = FRESCHEZZA_ORE_DEFAULT) {
  if (!row || !STATI.includes(row.stato_replicato) || !isIso(row.stato_replicato_at)) return true;
  return now.getTime() - Date.parse(row.stato_replicato_at) > freschezzaOre * 3600 * 1000;
}

/** Testo del riferimento all'autorizzazione: SOLO se numero e data sono entrambi compilati e il formato e' in D1. */
export function riferimentoAutorizzazione(row, formato) {
  if (!nonVuoto(formato) || !nonVuoto(row.numero_provvedimento) || !nonVuoto(row.data_autorizzazione)) return '';
  const [y, m, d] = String(row.data_autorizzazione).trim().split('-');
  const dataIt = y && m && d ? `${d}/${m}/${y}` : String(row.data_autorizzazione).trim();
  return formato.replaceAll('{numero}', row.numero_provvedimento.trim()).replaceAll('{data}', dataIt);
}

/**
 * Decide cosa emettere per UN blocco. Restituisce SEMPRE un esito; non lancia.
 *   ORIGINALE   -> versione_originale
 *   TRANSITORIA -> versione_transitoria se non vuota, altrimenti nessun output
 *   AUTORIZZATA -> versione_autorizzata se non vuota, altrimenti TRANSITORIA (catena)
 * Fail-closed: replica null/stale -> TRANSITORIA. MAI ORIGINALE per default.
 */
export function risolviBlocco(row, now = new Date(), cfg = {}) {
  const freschezza = cfg.freschezzaOre || FRESCHEZZA_ORE_DEFAULT;
  const dichiarato = row && STATI.includes(row.stato_replicato) ? row.stato_replicato : null;
  const stale = replicaStale(row, now, freschezza);
  let effettivo = stale ? 'TRANSITORIA' : dichiarato;
  let motivo = stale ? (dichiarato ? 'replica_stale' : 'replica_assente') : null;

  if (!row) return { block_id: null, stato_dichiarato: null, stato_effettivo: 'TRANSITORIA', testo: '', riferimento: '', motivo_fallback: 'blocco_assente' };

  if (effettivo === 'AUTORIZZATA' && !nonVuoto(row.versione_autorizzata)) {
    effettivo = 'TRANSITORIA';
    motivo = 'autorizzata_non_disponibile';
  }
  let testo = '';
  let riferimento = '';
  if (effettivo === 'ORIGINALE') testo = row.versione_originale || '';
  else if (effettivo === 'TRANSITORIA') testo = nonVuoto(row.versione_transitoria) ? row.versione_transitoria : '';
  else if (effettivo === 'AUTORIZZATA') {
    testo = row.versione_autorizzata;
    riferimento = riferimentoAutorizzazione(row, cfg.formatoRiferimento);
  }
  return { block_id: row.block_id, stato_dichiarato: dichiarato, stato_effettivo: effettivo, testo, riferimento, motivo_fallback: motivo };
}

/** Legge tutti i blocchi da D1 e li risolve. Se D1 non risponde LANCIA: il chiamante gestisce (stale-if-error o pagina di errore). */
export async function risolviTutti(db, now = new Date()) {
  const cfg = await leggiConfig(db);
  const { results } = await db.prepare('SELECT * FROM claim_blocks').all();
  const out = {};
  for (const r of results || []) out[r.block_id] = risolviBlocco(r, now, cfg);
  return out;
}

// ---------------------------------------------------------------------------
// Admin: salvataggio testi con revisioni immutabili
// ---------------------------------------------------------------------------
export function validaSalvataggio(body, cfg, rowCorrente) {
  const errori = [];
  if (!body || typeof body !== 'object') return ['Corpo richiesta non valido'];
  if (!nonVuoto(body.motivo)) errori.push('Il motivo e\' obbligatorio');
  const campi = CAMPI_TESTO.filter(c => body[c] !== undefined);
  if (campi.length === 0) errori.push('Nessun campo da aggiornare');
  for (const c of campi) {
    if (body[c] !== null && typeof body[c] !== 'string') errori.push(`Campo ${c} non valido`);
  }
  if (body.data_autorizzazione && !/^\d{4}-\d{2}-\d{2}$/.test(body.data_autorizzazione)) errori.push('data_autorizzazione: formato YYYY-MM-DD');
  if (cfg && cfg.requireProvvedimento && rowCorrente) {
    const dopo = { ...rowCorrente };
    for (const c of campi) dopo[c] = body[c];
    if (nonVuoto(dopo.versione_autorizzata) && !(nonVuoto(dopo.numero_provvedimento) && nonVuoto(dopo.data_autorizzazione))) {
      errori.push('Con versione AUTORIZZATA compilata servono numero_provvedimento e data_autorizzazione');
    }
  }
  return errori;
}

const norm = v => (v === undefined || v === '' ? null : v);

/** Applica le modifiche e scrive UNA revisione per ogni campo realmente cambiato, in un unico batch. */
export async function salvaBlocco(db, blockId, body, autore, now = new Date(), { tipo = 'modifica', ripristinaId = null } = {}) {
  const row = await db.prepare('SELECT * FROM claim_blocks WHERE block_id = ?').bind(blockId).first();
  if (!row) return { ok: false, status: 404, error: 'Blocco non trovato' };
  const cfg = await leggiConfig(db);
  const errori = validaSalvataggio(body, cfg, row);
  if (errori.length) return { ok: false, status: 400, error: errori.join('; ') };

  const ts = now.toISOString();
  const cambiati = CAMPI_TESTO.filter(c => body[c] !== undefined && norm(body[c]) !== norm(row[c]));
  if (cambiati.length === 0) return { ok: true, status: 200, cambiati: [], nota: 'nessuna modifica' };

  const stmts = [];
  const sets = cambiati.map(c => `${c} = ?`).concat(['updated_by = ?', 'updated_at = ?', 'motivo = ?']);
  // versione_originale non e' mai NOT NULL-violabile: se azzerata resta stringa vuota
  const vals = cambiati.map(c => (c === 'versione_originale' ? (body[c] || '') : c === 'versione_transitoria' ? (body[c] || '') : norm(body[c])));
  stmts.push(db.prepare(`UPDATE claim_blocks SET ${sets.join(', ')} WHERE block_id = ?`).bind(...vals, autore, ts, body.motivo.trim(), blockId));
  for (const c of cambiati) {
    stmts.push(db.prepare(
      'INSERT INTO claim_blocks_revisions (block_id, campo, testo_precedente, testo_nuovo, autore, creato_at, motivo, tipo, ripristina_revisione_id) VALUES (?,?,?,?,?,?,?,?,?)'
    ).bind(blockId, c, row[c] ?? null, norm(body[c]), autore, ts, body.motivo.trim(), tipo, ripristinaId));
  }
  await db.batch(stmts);
  return { ok: true, status: 200, cambiati, pagine: JSON.parse(row.pagine || '[]') };
}

/** Ripristino di una revisione: e' a sua volta una modifica revisionata e richiede il motivo. */
export async function ripristinaRevisione(db, blockId, revId, motivo, autore, now = new Date()) {
  const rev = await db.prepare('SELECT * FROM claim_blocks_revisions WHERE id = ? AND block_id = ?').bind(revId, blockId).first();
  if (!rev) return { ok: false, status: 404, error: 'Revisione non trovata' };
  if (!CAMPI_TESTO.includes(rev.campo)) return { ok: false, status: 400, error: 'Campo non ripristinabile' };
  // si ripristina il testo che il campo aveva PRIMA di quella revisione
  return salvaBlocco(db, blockId, { [rev.campo]: rev.testo_precedente, motivo }, autore, now, { tipo: 'ripristino', ripristinaId: revId });
}

// ---------------------------------------------------------------------------
// Replica dello stato dal CRM (webhook e riconciliazione)
// ---------------------------------------------------------------------------
export async function applicaStato(db, evento, origine, now = new Date()) {
  const ts = now.toISOString();
  const log = (blockId, stato, motivo, esito) => db.prepare(
    'INSERT INTO claim_sync_log (ricevuto_at, origine, block_id, stato, motivo, esito) VALUES (?,?,?,?,?,?)'
  ).bind(ts, origine, blockId ?? null, stato ?? null, motivo ?? null, esito).run().catch(() => {});

  const { block_id: blockId, stato, updated_at: upd, motivo } = evento || {};
  if (!BLOCK_ID_RE.test(String(blockId || '')) || !STATI.includes(stato) || !isIso(upd)) {
    await log(blockId, stato, motivo, 'rifiutato');
    return { ok: false, status: 400, error: 'Payload non valido (block_id, stato, updated_at ISO UTC)' };
  }
  const row = await db.prepare('SELECT block_id, stato_replicato, stato_crm_updated_at FROM claim_blocks WHERE block_id = ?').bind(blockId).first();
  if (!row) { await log(blockId, stato, motivo, 'rifiutato'); return { ok: false, status: 404, error: 'Blocco sconosciuto' }; }

  // evento piu' vecchio di quello gia' applicato: non si torna indietro (e non si rinfresca la replica)
  if (row.stato_crm_updated_at && Date.parse(upd) < Date.parse(row.stato_crm_updated_at)) {
    await log(blockId, stato, motivo, 'obsoleto');
    return { ok: true, status: 200, esito: 'obsoleto', pagine: [] };
  }
  const cambiato = row.stato_replicato !== stato;
  await db.prepare(
    'UPDATE claim_blocks SET stato_replicato = ?, stato_replicato_at = ?, stato_crm_updated_at = ?, stato_motivo = ? WHERE block_id = ?'
  ).bind(stato, ts, upd, motivo ? String(motivo).slice(0, 500) : null, blockId).run();
  await log(blockId, stato, motivo, cambiato ? 'applicato' : 'invariato');
  const full = await db.prepare('SELECT pagine FROM claim_blocks WHERE block_id = ?').bind(blockId).first();
  return { ok: true, status: 200, esito: cambiato ? 'applicato' : 'invariato', cambiato, pagine: JSON.parse((full && full.pagine) || '[]') };
}

// ---------------------------------------------------------------------------
// Health check (sola lettura: nessun dato di testo)
// ---------------------------------------------------------------------------
export async function calcolaHealth(db, now = new Date()) {
  const cfg = await leggiConfig(db);
  const { results } = await db.prepare('SELECT block_id, stato_replicato, stato_replicato_at FROM claim_blocks ORDER BY block_id').all();
  const blocchi = results || [];
  const mai = blocchi.filter(b => !b.stato_replicato).map(b => b.block_id);
  const ultimi = blocchi.map(b => b.stato_replicato_at).filter(isIso).sort();
  const ultimo = ultimi.length ? ultimi[ultimi.length - 1] : null;
  const minuti = ultimo ? Math.floor((now.getTime() - Date.parse(ultimo)) / 60000) : null;
  const staleOltreAlert = ultimo === null || minuti > SOGLIA_ALERT_MINUTI;
  const staleFreschezza = blocchi.filter(b => replicaStale(b, now, cfg.freschezzaOre)).map(b => b.block_id);
  return {
    stato: blocchi.length === 0 ? 'nessun_blocco' : staleOltreAlert ? 'stale' : 'fresh',
    ultimo_webhook_at: ultimo,
    minuti_dall_ultimo: minuti,
    soglia_alert_minuti: SOGLIA_ALERT_MINUTI,
    blocchi_totali: blocchi.length,
    blocchi_mai_sincronizzati: mai,
    blocchi_in_fail_closed: staleFreschezza,
    freschezza_ore: cfg.freschezzaOre,
  };
}

// ---------------------------------------------------------------------------
// Purge cache (best effort: non blocca mai il salvataggio o la replica)
// ---------------------------------------------------------------------------
export async function purgeUrls(env, paths, fetchImpl = fetch) {
  const zona = env && env.CF_ZONE_ID;
  const tok = env && env.CF_PURGE_TOKEN;
  const uniche = [...new Set((paths || []).filter(p => typeof p === 'string' && p.startsWith('/')))];
  if (uniche.length === 0) return { purged: false, motivo: 'nessuna_pagina' };
  if (!nonVuoto(zona) || !nonVuoto(tok)) return { purged: false, motivo: 'purge_non_configurato', pagine: uniche };
  const files = uniche.flatMap(p => [`https://www.ecura.it${p}`, `https://ecura.it${p}`]);
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetchImpl(`https://api.cloudflare.com/client/v4/zones/${zona}/purge_cache`, {
      method: 'POST', signal: ctrl.signal,
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ files }),
    });
    clearTimeout(t);
    return { purged: r.ok, status: r.status, pagine: uniche };
  } catch (e) {
    console.error('[claim-dm] purge fallito', e && e.message);
    return { purged: false, motivo: 'errore_rete', pagine: uniche };
  }
}
