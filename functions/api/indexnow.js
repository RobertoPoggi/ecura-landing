/**
 * Cloudflare Pages Function — GET|POST /api/indexnow
 *
 * Invia un ping IndexNow per una lista ESPLICITA di URL. Nessuna lista nel codice:
 * non esiste una modalita' "tutte le URL" (per un ping massivo si passa l'elenco).
 *
 * UTILIZZO
 *   POST /api/indexnow
 *        header  X-IndexNow-Secret: <INDEXNOW_SECRET>   (oppure campo "secret" nel body)
 *        body    { "urls": ["https://www.ecura.it/blog/slug/"] }
 *   GET  /api/indexnow?secret=<INDEXNOW_SECRET>&url=https://www.ecura.it/...&url=...   (test manuali)
 *
 * VALIDAZIONE (400 prima di qualsiasi chiamata di rete)
 *   - da 1 a 100 URL; ognuna deve iniziare con https://www.ecura.it/
 *   - nessun path in /admin/, /api/, /strategia-seo-link-building/ (esclusi da robots.txt)
 *
 * AUTENTICAZIONE: 401 su ENTRAMBI i metodi se il secret manca o e' errato.
 *
 * ENV (Cloudflare Pages → Settings → Variables and Secrets)
 *   INDEXNOW_SECRET — secret di accesso a questo endpoint. DA IMPOSTARE.
 *     Se non e' configurato si ricade sul default storico, che pero' coincide con la chiave IndexNow,
 *     la quale e' PUBBLICA (e' servita in chiaro da /<chiave>.txt): in quel caso l'endpoint
 *     NON e' realmente protetto.
 */

import { INDEXNOW_KEY, INDEXNOW_ENDPOINTS, validateUrls, sendIndexNow } from '../_lib/indexnow.js';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const reply = (obj, status = 200) =>
  new Response(JSON.stringify(obj, null, 2), { status, headers: JSON_HEADERS });

export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return reply({ error: 'Method not allowed' }, 405);
  }

  const expected = env.INDEXNOW_SECRET || INDEXNOW_KEY;   // default solo se la variabile non e' configurata
  const reqUrl = new URL(request.url);

  let supplied = null;
  let urls = [];
  let bodyOk = true;   // solo POST: body JSON con { urls: [...] }

  if (request.method === 'GET') {
    supplied = reqUrl.searchParams.get('secret');
    urls = reqUrl.searchParams.getAll('url');
  } else {
    supplied = request.headers.get('X-IndexNow-Secret');
    let body = null;
    try { body = await request.json(); } catch { body = null; }
    if (!supplied && body && typeof body.secret === 'string') supplied = body.secret;
    bodyOk = !!(body && Array.isArray(body.urls));
    if (bodyOk) urls = body.urls;
  }

  if (!supplied || supplied !== expected) return reply({ error: 'Unauthorized' }, 401);

  // 401 prima di tutto (nessuna informazione sul formato a chi non e' autenticato), poi 400
  if (!bodyOk) return reply({ error: 'Body JSON non valido: atteso { "urls": [...] }' }, 400);
  const v = validateUrls(urls);
  if (!v.ok) return reply({ error: v.error }, 400);

  const { results, errors } = await sendIndexNow(v.urls);
  const success = results.filter(r => r.ok);

  console.log(`[IndexNow] Submitted ${v.urls.length} URL to ${success.length}/${INDEXNOW_ENDPOINTS.length} endpoints`);

  return reply({
    submitted: v.urls.length,
    endpoints_contacted: INDEXNOW_ENDPOINTS.length,
    success_count: success.length,
    timestamp: new Date().toISOString(),
    results,
    errors,
  }, success.length > 0 ? 200 : 500);
}
