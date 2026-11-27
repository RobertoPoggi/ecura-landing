/**
 * POST /internal/claim-blocks/capture-original  (server-to-server dal CRM)
 * "Al primo giro vince il sito, poi vince D1": porta in D1 (versione_originale) il contenuto ATTUALE dei template di bordo,
 * solo dove e' diverso (idempotente). Body opzionale: { block_ids: ["EC-01", ...] } per limitare la cattura.
 * Risposta: { ok, blocchi: [{ block_id, esito: invariato|aggiornato|non_mappato|errore, byte_prima, byte_dopo }], purge }
 * Autenticazione: Authorization: Bearer <CLAIM_SYNC_TOKEN>. Mai esposto al browser. Non cambia stati ne' le altre versioni.
 */
import { checkServerToken, purgeGestito, purgePending, BLOCK_ID_RE } from '../../_lib/claim-blocks.js';
import { catturaOriginale } from '../../_lib/claim-capture.js';
import { internalJson } from '../../_lib/claim-http.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return internalJson({ error: 'Method not allowed' }, 405);
  const auth = checkServerToken(request, env);
  if (!auth.ok) return internalJson({ error: auth.error }, auth.status);
  if (!env.DB) return internalJson({ error: 'D1 non disponibile' }, 503);
  if (!env.ASSETS) return internalJson({ error: 'Asset non disponibili' }, 503);

  let body = {};
  try { body = await request.json(); } catch { body = {}; }
  let blockIds = null;
  if (body && body.block_ids !== undefined) {
    if (!Array.isArray(body.block_ids) || !body.block_ids.every(b => BLOCK_ID_RE.test(String(b)))) return internalJson({ error: 'block_ids non valido' }, 400);
    blockIds = body.block_ids;
  }
  const leggiPagina = async path => {
    const r = await env.ASSETS.fetch(new Request(new URL(path, request.url).toString(), { method: 'GET' }));
    if (!r.ok) throw new Error('asset non disponibile ' + r.status);
    return r.text();
  };
  try {
    const r = await catturaOriginale(env.DB, leggiPagina, { blockIds });
    // purge solo se qualcosa e' cambiato (o ne e' rimasto uno in sospeso): stessa logica di /sync
    const purge = (r.pagine.length || await purgePending(env.DB)) ? await purgeGestito(env.DB, env, r.pagine) : { purged: false, motivo: 'nessuna_modifica', pending: false };
    return internalJson({ ok: r.ok, blocchi: r.blocchi, purge, purge_ok: !purge.pending }, r.ok ? 200 : 500);
  } catch (e) {
    console.error('[claim-dm] capture-original fallita', e && e.message);
    return internalJson({ error: 'Errore interno' }, 500);
  }
}
