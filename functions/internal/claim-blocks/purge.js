/**
 * POST /internal/claim-blocks/purge  (server-to-server)
 * Body: { block_ids?: ["EC-01"], paths?: ["/"] }  - senza argomenti invalida le pagine di TUTTI i blocchi.
 * Pulsante "Invalida cache landing" del CRM. Autenticazione: Bearer CLAIM_SYNC_TOKEN.
 */
import { checkServerToken, purgeGestito } from '../../_lib/claim-blocks.js';
import { internalJson } from '../../_lib/claim-http.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return internalJson({ error: 'Method not allowed' }, 405);
  const auth = checkServerToken(request, env);
  if (!auth.ok) return internalJson({ error: auth.error }, auth.status);
  if (!env.DB) return internalJson({ error: 'D1 non disponibile' }, 503);
  let body = {};
  try { body = await request.json(); } catch { body = {}; }
  try {
    const { results } = await env.DB.prepare('SELECT block_id, pagine FROM claim_blocks').all();
    const ids = Array.isArray(body.block_ids) ? body.block_ids : null;
    // solo i path censiti nei blocchi: l'endpoint non puo' invalidare URL arbitrari
    const censiti = (results || []).filter(r => !ids || ids.includes(r.block_id)).flatMap(r => JSON.parse(r.pagine || '[]'));
    const richiesti = Array.isArray(body.paths) ? body.paths.filter(p => censiti.includes(p)) : censiti;
    return internalJson({ ok: true, purge: await purgeGestito(env.DB, env, richiesti) });
  } catch (e) {
    console.error('[claim-dm] purge fallito', e && e.message);
    return internalJson({ error: 'Errore interno' }, 500);
  }
}
