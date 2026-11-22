/**
 * POST /internal/claim-blocks/sync  (server-to-server dal CRM TeleMedCare)
 * Payload: { block_id, stato, updated_at, motivo }
 * Replica lo stato su D1 (stato_replicato / stato_replicato_at) e invalida la cache delle pagine che renderizzano il blocco.
 * Autenticazione: Authorization: Bearer <CLAIM_SYNC_TOKEN>. Mai esposto al browser.
 */
import { checkServerToken, applicaStato, purgeUrls } from '../../_lib/claim-blocks.js';
import { internalJson } from '../../_lib/claim-http.js';

export async function onRequest({ request, env, waitUntil }) {
  if (request.method !== 'POST') return internalJson({ error: 'Method not allowed' }, 405);
  const auth = checkServerToken(request, env);
  if (!auth.ok) return internalJson({ error: auth.error }, auth.status);
  if (!env.DB) return internalJson({ error: 'D1 non disponibile' }, 503);

  let body;
  try { body = await request.json(); } catch { return internalJson({ error: 'JSON non valido' }, 400); }
  try {
    const r = await applicaStato(env.DB, body, 'webhook');
    if (!r.ok) return internalJson({ error: r.error }, r.status);
    // il purge e' best effort e non cambia l'esito della replica; si fa solo se lo stato e' cambiato
    const purge = r.cambiato ? await purgeUrls(env, r.pagine) : { purged: false, motivo: 'stato_invariato' };
    return internalJson({ ok: true, esito: r.esito, purge });
  } catch (e) {
    console.error('[claim-dm] sync fallito', e && e.message);
    return internalJson({ error: 'Errore interno' }, 500);
  }
}
