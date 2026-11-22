/** POST /api/admin/claim-purge - pulsante "Invalida cache landing" (purge manuale di fallback) per tutte le pagine censite. */
import { json } from '../../_lib/admin-auth.js';
import { purgeGestito, tuttePagine } from '../../_lib/claim-blocks.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    return json({ ok: true, purge: await purgeGestito(env.DB, env, await tuttePagine(env.DB)) });
  } catch (e) { console.error('[claim-dm] purge admin fallito', e && e.message); return json({ error: 'Errore interno' }, 500); }
}
