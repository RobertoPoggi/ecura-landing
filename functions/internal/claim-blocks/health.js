/**
 * GET /internal/claim-blocks/health  (autenticato)
 * Stato di sincronizzazione CRM <-> landing: ultimo webhook ricevuto, fresh/stale, blocchi in fail-closed.
 * Non restituisce testi dei blocchi.
 */
import { checkServerToken, calcolaHealth } from '../../_lib/claim-blocks.js';
import { internalJson } from '../../_lib/claim-http.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return internalJson({ error: 'Method not allowed' }, 405);
  const auth = checkServerToken(request, env);
  if (!auth.ok) return internalJson({ error: auth.error }, auth.status);
  if (!env.DB) return internalJson({ error: 'D1 non disponibile' }, 503);
  try { return internalJson(await calcolaHealth(env.DB)); }
  catch (e) { console.error('[claim-dm] health fallito', e && e.message); return internalJson({ error: 'Errore interno' }, 500); }
}
