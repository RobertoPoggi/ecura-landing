/** POST /api/admin/claim-purge - pulsante "Invalida cache landing" (purge manuale di fallback) per tutte le pagine censite. */
import { json } from '../../_lib/admin-auth.js';
import { purgeUrls } from '../../_lib/claim-blocks.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const { results } = await env.DB.prepare('SELECT pagine FROM claim_blocks').all();
    return json({ ok: true, purge: await purgeUrls(env, (results || []).flatMap(r => JSON.parse(r.pagine || '[]'))) });
  } catch (e) { console.error('[claim-dm] purge admin fallito', e && e.message); return json({ error: 'Errore interno' }, 500); }
}
