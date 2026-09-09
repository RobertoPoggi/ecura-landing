/**
 * Cloudflare Pages Function — GET|POST /api/indexnow
 *
 * Invia un ping IndexNow a Bing (e agli altri motori supportati) per
 * tutte le URL del sitemap di ecura.it, segnalando che i contenuti
 * sono stati aggiornati.
 *
 * Endpoint IndexNow: https://api.indexnow.org/indexnow
 *
 * UTILIZZO:
 *   - Automatico: chiamata POST interna dopo ogni deploy (da CI/CD o
 *     dal Worker di deploy).
 *   - Manuale: GET /api/indexnow?secret=<INDEXNOW_SECRET>
 *     (parametro secret per evitare abusi)
 *
 * ENV VARS richieste (Cloudflare Pages → Settings → Variables):
 *   INDEXNOW_SECRET  — la chiave IndexNow (stesso valore del file
 *                      60d8edebf9f2486d9f8d08e6d776215d.txt)
 *                      Default fallback: '60d8edebf9f2486d9f8d08e6d776215d'
 */

const INDEXNOW_KEY_DEFAULT = '60d8edebf9f2486d9f8d08e6d776215d';
const HOST = 'www.ecura.it';

/** Tutte le URL pubbliche del sito — aggiornare insieme a sitemap.xml */
const URLS = [
  `https://${HOST}/`,
  `https://${HOST}/confronto-bracciali-anziani/`,
  `https://${HOST}/bracciale-anziani-detraibile/`,
  `https://${HOST}/come-funziona-bracciale-ecura/`,
  `https://${HOST}/guida-cadute-anziani/`,
  `https://${HOST}/guida-dispositivi-medici-teleassistenza/`,
  `https://${HOST}/statistiche-cadute-anziani-italia/`,
  `https://${HOST}/partner/`,
  `https://${HOST}/blog/`,
  `https://${HOST}/blog/guida-bracciale-cadute-anziani-2026/`,
  `https://${HOST}/blog/teleassistenza-anziani-come-funziona-costi/`,
  `https://${HOST}/blog/ecura-vs-seremy-confronto-2026/`,
  `https://${HOST}/blog/bracciale-anziani-detraibile-19-percento/`,
  `https://${HOST}/blog/cadute-casa-anziani-statistiche-prevenzione/`,
  `https://${HOST}/blog/dispositivo-medico-classe-iia-anziani/`,
  `https://${HOST}/blog/badante-vs-teleassistenza-costi-2026/`,
  `https://${HOST}/blog/gps-anziani-indoor-come-funziona/`,
  `https://${HOST}/blog/sidly-care-recensioni-clienti-ecura/`,
  `https://${HOST}/blog/prevenzione-cadute-anziani-10-consigli/`,
  `https://${HOST}/blog/anziano-solo-casa-soluzioni-sicurezza/`,
  `https://${HOST}/blog/centrale-operativa-h24-teleassistenza/`,
];

/** Motori che supportano IndexNow */
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://search.seznam.cz/indexnow',
  'https://yandex.com/indexnow',
];

export async function onRequest({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const key = env.INDEXNOW_SECRET || INDEXNOW_KEY_DEFAULT;

  // Protezione anti-abuso per chiamate GET manuali
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');
    if (secret !== key) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
  }

  const payload = {
    host: HOST,
    key: key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList: URLS,
  };

  const results = [];
  const errors  = [];

  // Invia a tutti gli endpoint in parallelo
  const sends = INDEXNOW_ENDPOINTS.map(async (endpoint) => {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
      const text = await res.text().catch(() => '');
      results.push({
        endpoint,
        status: res.status,
        ok: res.ok,
        response: text.substring(0, 200),
      });
    } catch (err) {
      errors.push({ endpoint, error: String(err) });
    }
  });

  await Promise.all(sends);

  const success = results.filter(r => r.ok || r.status === 202);
  const response = {
    submitted: URLS.length,
    endpoints_contacted: INDEXNOW_ENDPOINTS.length,
    success_count: success.length,
    timestamp: new Date().toISOString(),
    results,
    errors,
  };

  console.log(`[IndexNow] Submitted ${URLS.length} URLs to ${success.length}/${INDEXNOW_ENDPOINTS.length} endpoints`);

  return new Response(JSON.stringify(response, null, 2), {
    status: success.length > 0 ? 200 : 500,
    headers: corsHeaders,
  });
}
