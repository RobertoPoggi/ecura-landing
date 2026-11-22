// Seeding Claim DM (prompt §9 + integrativo §1). Funzioni pure + applicazione idempotente su un D1 (o shim di test).
//  - TRANSITORIA e AUTORIZZATA: dal file claim_matrix_seed.json (colonne versione_transitoria / versione_autorizzata)
//  - ORIGINALE: SOLO estratta dallo snapshot LIVE (mai da "elemento_originale_rilevato", che e' una citazione d'analisi)
//  - numero_provvedimento / data_autorizzazione: NULL
//  - stato_replicato: NULL (lo imposta il CRM; senza replica il render e' in fail-closed TRANSITORIA)
// Idempotenza: un blocco gia' presente NON viene toccato (le modifiche fatte in admin prevalgono) e non genera nuove revisioni.
import fs from 'node:fs';
import path from 'node:path';

export const BLOCCHI_CON_TESTO = ['EC-01', 'EC-02', 'EC-03', 'EC-04', 'EC-05', 'EC-06', 'EC-12'];
export const MOTIVO_SEED = 'Popolamento iniziale da Claim Matrix / snapshot live';
export const AUTORE_SEED = 'sistema/seed';

const vuoto = v => v == null || String(v).trim() === '' || String(v).trim() === '—';

// ---- estrazione ORIGINALE dallo snapshot -----------------------------------------------------------------------
function sezione(html, apertura) {
  const i = html.indexOf(apertura);
  if (i < 0) return null;
  const re = /<section\b|<\/section>/g; re.lastIndex = i + 1;
  let depth = 1, m;
  while ((m = re.exec(html))) { depth += m[0] === '</section>' ? -1 : 1; if (depth === 0) return html.slice(i, m.index + m[0].length); }
  return null;
}
const jsonLdCon = (html, tipi) => [...html.matchAll(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g)].map(m => m[0]).filter(b => tipi.some(t => b.includes(`"${t}"`)));
const righe = (html, re) => html.split('\n').filter(l => re.test(l));

const mainDi = h => { const i = h.indexOf('<main id="main-content">'); const j = h.indexOf('</main>', i); return i >= 0 && j > i ? h.slice(i, j + 7) : null; };

/**
 * Regioni estratte automaticamente dallo snapshot (leggi(file) -> html). Blocchi non elencati => ORIGINALE vuota e SEGNALATA:
 * non si inventa nulla. EC-02 (richiami al dispositivo sparsi su 8 pagine, senza una regione unica) resta da mappare a mano.
 */
export const ESTRATTORI = {
  'EC-01': l => { const h = l('home.html'); if (!h) return null; const i = h.indexOf('<h1>Bracciale Cadute Anziani'); const j = h.indexOf('</p>', h.indexOf('class="lead"', i)); return i >= 0 && j > i ? h.slice(i, j + 4) : null; },
  'EC-03': l => { const h = l('home.html'); if (!h) return null; const s = sezione(h, '<section class="mb-5" id="pricingPlan"'); return s ? [s, ...jsonLdCon(h, ['MedicalDevice', 'Product'])].join('\n') : null; },
  'EC-04': l => { const h = l('home.html'); return h ? sezione(h, '<section class="mt-5 py-5" id="confronto-bracciali"') : null; },
  'EC-05': l => { const h = l('home.html'); return h ? sezione(h, '<section id="recensioni"') : null; },
  'EC-06': l => { const h = l('home.html'); if (!h) return null; const r = righe(h, /<title>|<meta (?:name="description"|property="og:(?:title|description)"|name="twitter:(?:title|description)")/); return r.length ? r.join('\n') : null; },
  'EC-12': l => {
    const parti = ['confronto-bracciali-anziani.html', 'guida-dispositivi-medici-teleassistenza.html'].map(f => { const h = l(f); return h ? `<!-- ${f} -->\n${mainDi(h)}` : null; });
    return parti.every(p => p && !p.endsWith('null')) ? parti.join('\n') : null;
  },
};

export function estraiOriginali(snapshotDir) {
  const leggi = f => { const p = path.join(snapshotDir, f); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; };
  const out = {};
  for (const id of BLOCCHI_CON_TESTO) out[id] = ESTRATTORI[id] ? ESTRATTORI[id](leggi) : null;
  return out;
}

// ---- costruzione righe -----------------------------------------------------------------------------------------
export function costruisciRighe({ seedJson, blocchiMap, originali, estrattoAt }) {
  const per = Object.fromEntries((seedJson.blocchi || []).map(b => [b.block_id, b]));
  const rows = [];
  for (const id of BLOCCHI_CON_TESTO) {
    const src = per[id]; const map = (blocchiMap.blocchi || {})[id];
    if (!src) throw new Error(`Blocco ${id} assente dal file di seeding`);
    if (!map) throw new Error(`Blocco ${id} assente dalla mappatura pagine`);
    rows.push({
      block_id: id,
      titolo: map.titolo,
      pagine: JSON.stringify(map.pagine),
      versione_originale: originali[id] || '',
      versione_originale_estratta_at: originali[id] ? estrattoAt : null,
      versione_transitoria: vuoto(src.versione_transitoria) ? '' : src.versione_transitoria,
      versione_autorizzata: vuoto(src.versione_autorizzata) ? null : src.versione_autorizzata,
    });
  }
  return rows;
}

// ---- applicazione idempotente ----------------------------------------------------------------------------------
export async function applicaSeed(db, rows, now = new Date()) {
  const ts = now.toISOString(); const esito = { inseriti: [], gia_presenti: [] };
  for (const r of rows) {
    const ex = await db.prepare('SELECT block_id FROM claim_blocks WHERE block_id = ?').bind(r.block_id).first();
    if (ex) { esito.gia_presenti.push(r.block_id); continue; }
    const stmts = [db.prepare(
      `INSERT INTO claim_blocks (block_id, titolo, pagine, stato_replicato, versione_originale, versione_originale_estratta_at,
        versione_transitoria, versione_autorizzata, numero_provvedimento, data_autorizzazione, updated_by, updated_at, motivo)
       VALUES (?,?,?,NULL,?,?,?,?,NULL,NULL,?,?,?)`
    ).bind(r.block_id, r.titolo, r.pagine, r.versione_originale, r.versione_originale_estratta_at, r.versione_transitoria, r.versione_autorizzata, AUTORE_SEED, ts, MOTIVO_SEED)];
    for (const c of ['versione_originale', 'versione_transitoria', 'versione_autorizzata']) {
      if (r[c] == null || r[c] === '') continue;
      stmts.push(db.prepare(
        'INSERT INTO claim_blocks_revisions (block_id, campo, testo_precedente, testo_nuovo, autore, creato_at, motivo, tipo) VALUES (?,?,NULL,?,?,?,?,?)'
      ).bind(r.block_id, c, r[c], AUTORE_SEED, ts, MOTIVO_SEED, 'seed'));
    }
    await db.batch(stmts);
    esito.inseriti.push(r.block_id);
  }
  return esito;
}

// ---- SQL per l'applicazione su D1 remoto (solo dopo conferma esplicita; il file contiene testi regolatori) -------
const q = v => (v == null ? 'NULL' : `'${String(v).replaceAll("'", "''")}'`);
export function generaSql(rows, now = new Date()) {
  const ts = now.toISOString(); const o = [`-- Seeding Claim DM generato ${ts}. CONTIENE TESTI REGOLATORI: non committare. Idempotente (INSERT OR IGNORE).`];
  for (const r of rows) {
    o.push(`INSERT OR IGNORE INTO claim_blocks (block_id, titolo, pagine, stato_replicato, versione_originale, versione_originale_estratta_at, versione_transitoria, versione_autorizzata, numero_provvedimento, data_autorizzazione, updated_by, updated_at, motivo) VALUES (${q(r.block_id)},${q(r.titolo)},${q(r.pagine)},NULL,${q(r.versione_originale)},${q(r.versione_originale_estratta_at)},${q(r.versione_transitoria)},${q(r.versione_autorizzata)},NULL,NULL,${q(AUTORE_SEED)},${q(ts)},${q(MOTIVO_SEED)});`);
    for (const c of ['versione_originale', 'versione_transitoria', 'versione_autorizzata']) {
      if (r[c] == null || r[c] === '') continue;
      // la revisione di seed si inserisce solo se il blocco e' appena stato creato da questo seed (nessuna revisione 'seed' per quel campo)
      o.push(`INSERT INTO claim_blocks_revisions (block_id, campo, testo_precedente, testo_nuovo, autore, creato_at, motivo, tipo) SELECT ${q(r.block_id)},${q(c)},NULL,${q(r[c])},${q(AUTORE_SEED)},${q(ts)},${q(MOTIVO_SEED)},'seed' WHERE NOT EXISTS (SELECT 1 FROM claim_blocks_revisions WHERE block_id=${q(r.block_id)} AND campo=${q(c)});`);
    }
  }
  return o.join('\n') + '\n';
}
