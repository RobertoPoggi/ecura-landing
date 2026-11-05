/**
 * Helper IndexNow condiviso (Pages Functions).
 * Questo file non esporta onRequest*, quindi non genera route.
 *
 * Regola d'oro: il ping NON deve mai essere una precondizione di nulla.
 *   - notifyIndexNow() non lancia e non rigetta mai: ogni errore finisce in console.error
 *   - ogni richiesta ha un timeout (5 s) con AbortController
 *   - pingOnPublish() usa context.waitUntil() se disponibile, cosi' chi pubblica non attende la rete
 *
 * Nessuna lista di URL in questo file: la lista arriva sempre dal chiamante.
 */

export const HOST = 'www.ecura.it';
export const ORIGIN = `https://${HOST}/`;
/** Chiave IndexNow: identica al contenuto di /60d8edebf9f2486d9f8d08e6d776215d.txt (non e' un segreto). */
export const INDEXNOW_KEY = '60d8edebf9f2486d9f8d08e6d776215d';
export const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

/** api.indexnow.org = relay verso tutti i partner (Yandex, Seznam, Naver, Yep...); Bing diretto. */
export const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
];

export const MAX_URLS = 100;
export const TIMEOUT_MS = 5000;

/** Path esclusi da robots.txt: non si notificano mai. */
const EXCLUDED_PATHS = ['/admin', '/api', '/strategia-seo-link-building'];

/**
 * Valida una lista di URL. Ritorna { ok: true, urls } oppure { ok: false, error }.
 * Nessuna chiamata di rete.
 */
export function validateUrls(input) {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: 'Serve almeno 1 URL' };
  }
  if (input.length > MAX_URLS) {
    return { ok: false, error: `Massimo ${MAX_URLS} URL per richiesta (ricevute ${input.length})` };
  }
  const urls = [];
  for (const u of input) {
    if (typeof u !== 'string' || !u.startsWith(ORIGIN)) {
      return { ok: false, error: `URL non valida: deve iniziare con ${ORIGIN} (${String(u).slice(0, 80)})` };
    }
    let p;
    try { p = new URL(u); } catch { return { ok: false, error: `URL malformata: ${u.slice(0, 80)}` }; }
    if (p.hostname !== HOST) return { ok: false, error: `Host non valido: ${p.hostname}` };
    for (const ex of EXCLUDED_PATHS) {
      if (p.pathname === ex || p.pathname.startsWith(ex + '/')) {
        return { ok: false, error: `Path escluso da robots.txt (${ex}/): ${u.slice(0, 80)}` };
      }
    }
    urls.push(u);
  }
  return { ok: true, urls: [...new Set(urls)] };
}

/** URL pubblica di un articolo del blog. */
export const articleUrl = (slug) => `${ORIGIN}blog/${encodeURIComponent(slug)}/`;

async function postWithTimeout(endpoint, body, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body,
      signal: ctrl.signal,
    });
    const text = await res.text().catch(() => '');
    return { endpoint, status: res.status, ok: res.ok || res.status === 202, response: text.substring(0, 200) };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Invia la lista (gia' validata) a tutti gli endpoint in parallelo.
 * Ritorna sempre { results, errors }: una singola richiesta fallita (rete, timeout) finisce in errors.
 */
export async function sendIndexNow(urls, { timeoutMs = TIMEOUT_MS } = {}) {
  const payload = JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: KEY_LOCATION, urlList: urls });
  const results = [];
  const errors = [];
  await Promise.all(INDEXNOW_ENDPOINTS.map(async (endpoint) => {
    try {
      results.push(await postWithTimeout(endpoint, payload, timeoutMs));
    } catch (err) {
      errors.push({ endpoint, error: err && err.name === 'AbortError' ? `timeout ${timeoutMs} ms` : String(err) });
    }
  }));
  return { results, errors };
}

/**
 * Notifica IndexNow senza mai lanciare ne' rigettare. Il risultato e' solo informativo.
 * `env` e' accettato per simmetria con le Function (non serve alcun secret per inviare).
 */
export async function notifyIndexNow(urls, env, opts) {
  try {
    const v = validateUrls(urls);
    if (!v.ok) { console.error('[IndexNow] ping saltato:', v.error); return { sent: false, reason: v.error }; }
    const { results, errors } = await sendIndexNow(v.urls, opts);
    const okCount = results.filter(r => r.ok).length;
    console.log(`[IndexNow] ${v.urls.length} URL → ${okCount}/${INDEXNOW_ENDPOINTS.length} endpoint OK` +
      (errors.length ? ` · errori: ${errors.map(e => `${e.endpoint} ${e.error}`).join('; ')}` : '') +
      (results.some(r => !r.ok) ? ` · rifiutati: ${results.filter(r => !r.ok).map(r => `${r.endpoint} HTTP ${r.status}`).join('; ')}` : ''));
    return { sent: true, ok: okCount, results, errors };
  } catch (e) {
    console.error('[IndexNow] ping fallito', e);
    return { sent: false, reason: String(e) };
  }
}

/**
 * Da chiamare DOPO la scrittura su D1 e prima di rispondere. Non lancia mai e non blocca la risposta
 * (waitUntil se disponibile, altrimenti attende dentro try/catch).
 */
export async function pingOnPublish(context, urls) {
  try {
    const task = notifyIndexNow(urls, context && context.env);   // non rigetta mai
    if (context && typeof context.waitUntil === 'function') context.waitUntil(task);
    else await task;
  } catch (e) {
    console.error('[IndexNow] ping fallito', e);
  }
}
