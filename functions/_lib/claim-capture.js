/**
 * Cattura "ORIGINALE dal sito" (Fase 2-ter): al primo giro vince il sito, poi vince D1.
 * Questo file non esporta onRequest*, quindi non genera route.
 *
 * Per ogni blocco con una REGIONE marcata nei template di bordo (<!--claim:EC-XX--> ... <!--/claim:EC-XX-->, le stesse
 * regioni di PAGINE e del seed) estrae il contenuto ATTUALE del template e lo confronta byte per byte con versione_originale:
 *   identico -> nessuna scrittura ('invariato'); diverso -> sovrascrive con revisione ('aggiornato').
 * Idempotente: un secondo giro senza modifiche ai template non scrive nulla.
 * I template si leggono dagli asset (env.ASSETS, come il render): nessuna richiesta HTTP verso se stessi.
 * Non tocca mai versione_transitoria / versione_autorizzata / stato.
 */
import { salvaBlocco } from './claim-blocks.js';
import { PAGINE } from './claim-pagine.js';

export const AUTORE_CATTURA = 'sistema/sync-originale';
export const MOTIVO_CATTURA = 'Sincronizzazione ORIGINALE dal sito (primo giro o template modificato)';
export const TIPO_CATTURA = 'sync_originale';

const RE_BLOCCO = /<!--claim:(EC-\d{2})-->([\s\S]*?)<!--\/claim:\1-->/g;
const byteLen = s => new TextEncoder().encode(String(s ?? '')).length;

/** Regioni marcate di un template: { 'EC-01': '<contenuto>', ... }. Una regione duplicata nella stessa pagina e' un errore. */
export function estraiRegioni(html) {
  const out = {};
  for (const m of String(html).matchAll(RE_BLOCCO)) {
    if (Object.prototype.hasOwnProperty.call(out, m[1])) throw new Error(`regione ${m[1]} duplicata`);
    out[m[1]] = m[2];
  }
  return out;
}

/** Blocchi mappati = quelli dichiarati in PAGINE (hanno una regione marcata nel template). */
export function blocchiMappati() {
  const mappa = {};
  for (const [path, cfg] of Object.entries(PAGINE)) for (const id of cfg.blocchi || []) (mappa[id] ||= []).push(path);
  return mappa;
}

/**
 * @param db           D1 (o shim)
 * @param leggiPagina  async path -> html del template statico (asset di bordo)
 * @param opts.blockIds  se presente, limita la cattura a questi blocchi (gli altri non vengono toccati ne' riportati)
 * @returns { ok, blocchi:[{block_id, esito, byte_prima, byte_dopo, ...}], pagine:[...da invalidare] }
 *   esito: 'invariato' | 'aggiornato' | 'non_mappato' | 'errore'
 */
export async function catturaOriginale(db, leggiPagina, { now = new Date(), blockIds = null } = {}) {
  const mappati = blocchiMappati();
  const { results } = await db.prepare('SELECT block_id, versione_originale, pagine FROM claim_blocks ORDER BY block_id').all();
  const righe = (results || []).filter(r => !blockIds || blockIds.includes(r.block_id));

  // un solo fetch per pagina
  const cachePagine = new Map();
  const regioniDi = async path => {
    if (!cachePagine.has(path)) {
      cachePagine.set(path, (async () => estraiRegioni(await leggiPagina(path)))().then(v => ({ v }), e => ({ e })));
    }
    const r = await cachePagine.get(path);
    if (r.e) throw r.e;
    return r.v;
  };

  const blocchi = [];
  const pagine = new Set();
  for (const r of righe) {
    const prima = byteLen(r.versione_originale);
    const paths = mappati[r.block_id];
    if (!paths) { blocchi.push({ block_id: r.block_id, esito: 'non_mappato', byte_prima: prima, byte_dopo: prima }); continue; }
    try {
      const contenuti = [];
      for (const p of paths) {
        const reg = await regioniDi(p);
        if (!Object.prototype.hasOwnProperty.call(reg, r.block_id)) throw new Error(`marcatore ${r.block_id} mancante in ${p}`);
        contenuti.push(reg[r.block_id]);
      }
      if (contenuti.some(c => c !== contenuti[0])) throw new Error('regioni discordanti tra pagine');
      const nuovo = contenuti[0];
      if ((r.versione_originale ?? '') === nuovo) {
        blocchi.push({ block_id: r.block_id, esito: 'invariato', byte_prima: prima, byte_dopo: prima });
        continue;
      }
      const s = await salvaBlocco(db, r.block_id, { versione_originale: nuovo, motivo: MOTIVO_CATTURA }, AUTORE_CATTURA, now, { tipo: TIPO_CATTURA });
      if (!s.ok) throw new Error(s.error || 'salvataggio non riuscito');
      for (const p of (s.pagine || [])) pagine.add(p);
      blocchi.push({ block_id: r.block_id, esito: 'aggiornato', byte_prima: prima, byte_dopo: byteLen(nuovo) });
    } catch (e) {
      blocchi.push({ block_id: r.block_id, esito: 'errore', errore: String(e && e.message || e).slice(0, 200), byte_prima: prima, byte_dopo: prima });
    }
  }
  return { ok: !blocchi.some(b => b.esito === 'errore'), blocchi, pagine: [...pagine] };
}
