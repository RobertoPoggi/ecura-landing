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
    staleMaxOre: Number(cfg.stale_max_ore) > 0 ? Number(cfg.stale_max_ore) : 24,
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
  const numero = row.numero_provvedimento.trim();
  return formato.replaceAll('{numero_provvedimento}', numero).replaceAll('{data_autorizzazione}', dataIt)
    .replaceAll('{numero}', numero).replaceAll('{data}', dataIt);
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
  } else if (effettivo === 'AUTORIZZATA' && controllaPubblicabilita(row.versione_autorizzata, 'versione_autorizzata').some(a => a === 'segnaposto' || a === 'istruzione_non_testo')) {
    // la matrice contiene, per AUTORIZZATA, anche istruzioni ("Versione statica autorizzata con...") e segnaposti ("provv. n. ___"):
    // non sono testo pubblicabile. Si ricade sulla TRANSITORIA, come se l'autorizzata non fosse ancora disponibile.
    effettivo = 'TRANSITORIA';
    motivo = 'autorizzata_non_pubblicabile';
  }
  let testo = '';
  let riferimento = '';
  if (effettivo === 'ORIGINALE') testo = nonVuoto(row.versione_originale) ? row.versione_originale : '';
  else if (effettivo === 'TRANSITORIA') testo = nonVuoto(row.versione_transitoria) ? row.versione_transitoria : '';
  else if (effettivo === 'AUTORIZZATA') {
    testo = row.versione_autorizzata;
    riferimento = riferimentoAutorizzazione(row, cfg.formatoRiferimento);
  }
  // ORIGINALE senza testo in D1 (blocco non mappato, es. EC-02): il blocco NON sostituisce nulla, resta il contenuto statico del
  // template. Una pagina non perde mai contenuto per un blocco non mappato. (Diverso da TRANSITORIA vuota: li' non si emette nulla.)
  const statico = effettivo === 'ORIGINALE' && !nonVuoto(row.versione_originale);
  return { block_id: row.block_id, stato_dichiarato: dichiarato, stato_effettivo: effettivo, testo, riferimento, motivo_fallback: motivo, statico };
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
  const { results } = await db.prepare('SELECT block_id, stato_replicato, stato_replicato_at, versione_transitoria, versione_autorizzata, length(versione_originale) > 0 AS ha_originale FROM claim_blocks ORDER BY block_id').all();
  const blocchi = results || [];
  const mai = blocchi.filter(b => !b.stato_replicato).map(b => b.block_id);
  const ultimi = blocchi.map(b => b.stato_replicato_at).filter(isIso).sort();
  const ultimo = ultimi.length ? ultimi[ultimi.length - 1] : null;
  const minuti = ultimo ? Math.floor((now.getTime() - Date.parse(ultimo)) / 60000) : null;
  const staleOltreAlert = ultimo === null || minuti > SOGLIA_ALERT_MINUTI;
  const staleFreschezza = blocchi.filter(b => replicaStale(b, now, cfg.freschezzaOre)).map(b => b.block_id);
  const pending = await purgePending(db);
  const conAvvisi = blocchi.filter(b => Object.keys(avvisiBlocco(b)).length).map(b => b.block_id);
  return {
    stato: blocchi.length === 0 ? 'nessun_blocco' : staleOltreAlert ? 'stale' : 'fresh',
    purge_pending: pending,
    allarme: blocchi.length > 0 && (staleOltreAlert || pending),
    blocchi_con_testi_non_pubblicabili: conAvvisi,
    blocchi_senza_originale: blocchi.filter(b => !b.ha_originale).map(b => b.block_id),
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

// ---------------------------------------------------------------------------
// Purge "a prova di errore": un purge fallito o non configurato NON deve passare inosservato.
// Lo stale-if-error e' sicuro per compliance SOLO se la cache e' sempre stata invalidata a ogni cambio:
// se un purge fallisce si accende purge_pending (visibile in health) e il prossimo purge invalida TUTTE le pagine.
// ---------------------------------------------------------------------------
export async function tuttePagine(db) {
  const { results } = await db.prepare('SELECT pagine FROM claim_blocks').all();
  return [...new Set((results || []).flatMap(r => JSON.parse(r.pagine || '[]')))];
}

export async function purgePending(db) {
  try { const r = await db.prepare("SELECT valore FROM claim_config WHERE chiave = 'purge_pending'").first(); return !!r && r.valore === '1'; }
  catch { return false; }
}

export async function purgeGestito(db, env, paths, fetchImpl = fetch, now = new Date()) {
  const pendente = await purgePending(db);
  // con un purge in sospeso il prossimo tentativo invalida TUTTE le pagine censite
  const daPurgare = pendente ? await tuttePagine(db) : paths;
  const r = await purgeUrls(env, daPurgare, fetchImpl);
  if (r.motivo === 'nessuna_pagina') return { ...r, pending: pendente };
  const nuovo = r.purged === true ? false : true;   // riuscito: azzera (era totale se in sospeso); fallito: resta/diventa in sospeso
  if (nuovo !== pendente) {
    await db.prepare("INSERT INTO claim_config (chiave, valore, updated_at) VALUES ('purge_pending', ?, ?) ON CONFLICT(chiave) DO UPDATE SET valore = excluded.valore, updated_at = excluded.updated_at")
      .bind(nuovo ? '1' : '0', now.toISOString()).run().catch(() => {});
  }
  return { ...r, pending: nuovo };
}

// ---------------------------------------------------------------------------
// stale-if-error (render): D1 giu' -> ultima pagina buona in cache; nessuna cache -> pagina di errore neutra.
// MAI un ripiego su contenuti ORIGINALE: in nessun ramo si legge versione_originale fuori dalla catena di render.
// ---------------------------------------------------------------------------
export const STALE_MAX_ORE_DEFAULT = 24;
const HDR_CACHED_AT = 'x-claim-cached-at';

export function paginaErrore() {
  // Pagina volutamente generica: nessun riferimento a claim, sincronizzazione o stati.
  return new Response(
    '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Servizio momentaneamente non disponibile</title></head>' +
    '<body><h1>Servizio momentaneamente non disponibile</h1><p>Riprova tra qualche minuto.</p></body></html>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '120', 'X-Robots-Tag': 'noindex' } }
  );
}

/**
 * render(): deve leggere D1 e restituire una Response; se D1 non risponde LANCIA.
 * cache: interfaccia Cache API (match/put) con chiave = request.
 * Ritorna { response, origine: 'fresh' | 'stale' | 'errore' } (origine serve ai test e ai log, non al pubblico).
 */
export async function renderConStale(request, { render, cache, now = new Date(), staleMaxOre = STALE_MAX_ORE_DEFAULT, waitUntil = () => {} }) {
  try {
    const res = await render();
    if (res && res.status === 200 && cache) {
      const copia = new Response(res.clone().body, res);
      copia.headers.set(HDR_CACHED_AT, now.toISOString());
      waitUntil(Promise.resolve(cache.put(request, copia)).catch(() => {}));
    }
    return { response: res, origine: 'fresh' };
  } catch (e) {
    console.error('[claim-dm] render fallito (D1?)', e && e.message);
  }
  try {
    const hit = cache ? await cache.match(request) : null;
    const quando = hit && hit.headers.get(HDR_CACHED_AT);
    if (hit && isIso(quando) && now.getTime() - Date.parse(quando) <= staleMaxOre * 3600 * 1000) {
      const out = new Response(hit.body, hit);
      out.headers.delete(HDR_CACHED_AT);
      return { response: out, origine: 'stale' };
    }
  } catch (e) { console.error('[claim-dm] lettura cache fallita', e && e.message); }
  return { response: paginaErrore(), origine: 'errore' };
}

// ---------------------------------------------------------------------------
// Controllo di pubblicabilita' dei testi (avvisi, non blocca il salvataggio ne' il render):
// il seeding carica i testi della matrice cosi' come sono, ma alcuni sono istruzioni o note interne.
// ---------------------------------------------------------------------------
export function controllaPubblicabilita(testo, campo = 'versione_transitoria') {
  const v = typeof testo === 'string' ? testo : '';
  if (v.trim() === '') return [];
  const avvisi = [];
  if (/_{3,}/.test(v)) avvisi.push('segnaposto');
  if (/\(SEO\s*:/i.test(v)) avvisi.push('nota_interna_seo');
  if (/^[A-ZÀ-Ü0-9][A-ZÀ-Ü0-9 “”"'«»()\/\-]{3,}\s—\s/m.test(v)) avvisi.push('etichetta_di_struttura');
  if (/JSON-LD|RIMOSSO a monte/i.test(v)) avvisi.push('nota_implementazione');
  if (campo === 'versione_autorizzata' && /^(Versione|Markup|Confronto|Testimonial|Meta\/title|Solo versione|Purge|n\/a)\b/i.test(v.trim())) avvisi.push('istruzione_non_testo');
  if (campo === 'versione_transitoria' && /^Riscrittura\b/i.test(v.trim())) avvisi.push('istruzione_non_testo');
  return avvisi;
}

export function avvisiBlocco(row) {
  const out = {};
  for (const c of ['versione_transitoria', 'versione_autorizzata']) {
    const a = controllaPubblicabilita(row[c], c);
    if (a.length) out[c] = a;
  }
  return out;
}
