#!/usr/bin/env node
/**
 * ping-indexnow.js — notifica IndexNow SELETTIVA (eCura)
 *
 * Notifica SOLO le URL passate da riga di comando: una pagina nuova non deve
 * essere diluita insieme a decine di URL invariate.
 *
 *   IndexNow (api.indexnow.org = relay verso tutti i partner; Bing diretto)
 *   → Bing, Yandex, Seznam, Naver, Yep.
 *
 * Google: il ping HTTP (google.com/ping?sitemap=) è DEPRECATO e risponde 404.
 *   L'unica via programmatica è la Search Console API (OAuth 2.0). Per una singola
 *   pagina bastano 30 secondi manuali: GSC → Ispezione URL → "Richiedi indicizzazione".
 * Agenti AI (GPTBot, ClaudeBot, PerplexityBot, Gemini, Grok…): nessun endpoint di ping
 *   pubblico; leggono sitemap.xml, llms.txt e ai.txt con la propria cadenza.
 *
 * Uso:  node ping-indexnow.js <url> [url2 ...] [--dry-run]
 *       node ping-indexnow.js --all [--dry-run]     (solo casi eccezionali, es. migrazione)
 *
 * Da eseguire DOPO il deploy: ogni URL deve già rispondere 200, altrimenti lo script si ferma.
 */

const KEY      = process.env.INDEXNOW_KEY || '60d8edebf9f2486d9f8d08e6d776215d';
const HOST     = 'www.ecura.it';
const ORIGIN   = `https://${HOST}/`;
const KEY_URL  = `https://${HOST}/${KEY}.txt`;
const SITEMAP  = `https://${HOST}/sitemap.xml`;
const TIMEOUT  = 15000;

// Path vietati da robots.txt: non si notificano mai
const EXCLUDED_PATHS = ['/admin', '/strategia-seo-link-building', '/api'];

// ─── IndexNow endpoints ─────────────────────────────────────────────────────
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',   // relay → tutti i partner IndexNow (Yandex, Seznam, Naver, Yep…)
  'https://www.bing.com/indexnow',       // Bing diretto
];

const USAGE = `Uso: node ping-indexnow.js <url> [url2 ...] [--dry-run]
Esempio: node ping-indexnow.js https://www.ecura.it/blog/nuovo-articolo/
         node ping-indexnow.js --all [--dry-run]   (intero sitemap: solo casi eccezionali)`;

function fail(msg) { console.error(`✗ ${msg}`); process.exit(1); }

// ─── Argomenti ──────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const flags = new Set(), urls = [];
  for (const a of argv) {
    if (a.startsWith('--')) flags.add(a); else urls.push(a);
  }
  for (const f of flags) if (f !== '--dry-run' && f !== '--all') fail(`Opzione sconosciuta: ${f}\n${USAGE}`);
  return { dry: flags.has('--dry-run'), all: flags.has('--all'), urls };
}

// ─── Validazioni ────────────────────────────────────────────────────────────
function validateShape(u) {
  if (!u.startsWith(ORIGIN)) fail(`Host non valido: ${u} (atteso ${ORIGIN}…)`);
  let p;
  try { p = new URL(u); } catch { fail(`URL non valida: ${u}`); }
  if (p.hostname !== HOST) fail(`Host non valido: ${u} (atteso ${HOST})`);
  for (const ex of EXCLUDED_PATHS) {
    if (p.pathname === ex || p.pathname.startsWith(ex + '/')) fail(`URL vietata da robots.txt (${ex}/): ${u}`);
  }
}

// redirect: 'manual' → un 301/302 non viene seguito e quindi non passa per 200
async function httpStatus(url) {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT) });
    const body = await res.text().catch(() => '');
    return { status: res.status, body };
  } catch (e) {
    return { status: 0, body: '', error: e.name === 'TimeoutError' ? `timeout ${TIMEOUT / 1000}s` : e.message };
  }
}

async function validateLive(urls) {
  const results = await Promise.all(urls.map(async u => ({ u, ...(await httpStatus(u)) })));
  let bad = 0;
  for (const r of results) {
    if (r.status === 200) console.log(`✓ 200  ${r.u}`);
    else { bad++; console.error(`✗ ${r.u} risponde ${r.status || 'errore'}${r.error ? ' (' + r.error + ')' : ''} — non pingare un URL che non è 200`); }
  }
  if (bad) fail(`${bad} URL non valide: nessun invio.`);
}

async function validateKeyFile() {
  const { status, body, error } = await httpStatus(KEY_URL);
  if (status !== 200) fail(`Key file non raggiungibile: ${KEY_URL} → ${status || error}. IndexNow risponderebbe 403.`);
  if (body.trim() !== KEY) fail(`Key file non valido: il contenuto di ${KEY_URL} non coincide con la chiave. IndexNow risponderebbe 403.`);
  console.log('✓ key file OK');
}

// ─── --all: URL ricavate da sitemap.xml (nessun elenco duplicato nel codice) ─
async function urlsFromSitemap() {
  const { status, body, error } = await httpStatus(SITEMAP);
  if (status !== 200) fail(`sitemap.xml non raggiungibile: ${status || error}`);
  // <loc> delle pagine; <image:loc> non corrisponde a questo pattern
  const urls = [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]);
  if (!urls.length) fail('sitemap.xml senza <loc>');
  return urls;
}

// ─── Invio ──────────────────────────────────────────────────────────────────
const EXPLAIN = {
  400: 'payload malformato',
  403: 'key file non valido o non raggiungibile',
  422: 'URL o host non corrispondono alla chiave',
  429: 'troppe richieste: hai pingato troppo spesso — non ripetere ora',
};

async function pingIndexNow(payload) {
  const results = await Promise.allSettled(
    INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      const res  = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body:    payload,
        signal:  AbortSignal.timeout(20000),
      });
      const text = await res.text().catch(() => '').then(t => t.trim());
      const ok   = res.status === 200 || res.status === 202;
      const why  = !ok && EXPLAIN[res.status] ? ` (${EXPLAIN[res.status]})` : '';
      const tail = !ok && text ? ` — ${text.substring(0, 120)}` : '';
      console.log(`  ${ok ? '✅' : '❌'} ${endpoint.replace('https://', '')} → HTTP ${res.status}${why}${tail}`);
      return { ok };
    })
  );
  results.forEach((r, i) => { if (r.status === 'rejected') console.log(`  ❌ ${INDEXNOW_ENDPOINTS[i].replace('https://', '')} → errore di rete: ${r.reason?.message || r.reason}`); });
  return results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
}

function printGoogleNote() {
  console.log(`\n  Google: nessun ping automatico (google.com/ping?sitemap → 404, deprecato).`);
  console.log(`  L'unica via programmatica è la Search Console API (OAuth 2.0).`);
  console.log(`  Per una singola pagina: GSC → Ispezione URL → "Richiedi indicizzazione" (30 secondi).`);
  console.log(`  Gli agenti AI (GPTBot, ClaudeBot, PerplexityBot, Gemini, Grok…) non hanno endpoint di ping:`);
  console.log(`  leggono sitemap.xml, llms.txt e ai.txt con la propria cadenza.\n`);
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const { dry, all, urls: cli } = parseArgs(process.argv.slice(2));

  if (!all && cli.length === 0) { console.error(USAGE); process.exit(1); }

  cli.forEach(validateShape);                          // fallisce presto, prima di qualsiasi rete
  let urls = cli;
  if (all) urls = [...cli, ...(await urlsFromSitemap())];
  urls = [...new Set(urls)];
  urls.forEach(validateShape);

  console.log(`\n🚀  eCura — IndexNow selettivo  |  ${new Date().toLocaleString('it-IT')}`);
  console.log(`    Host: ${HOST}  |  ${urls.length} URL${all ? '  (--all da sitemap.xml)' : ''}${dry ? '  |  DRY-RUN' : ''}\n`);

  await validateLive(urls);
  await validateKeyFile();

  const payload = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_URL, urlList: urls });

  if (dry) {
    console.log('\n--- payload (dry-run, nessun invio) ---');
    console.log(payload);
    process.exit(0);
  }

  console.log(`\n━━━ IndexNow — ${urls.length} URL → ${INDEXNOW_ENDPOINTS.length} endpoint ━━━\n`);
  console.log(`  Payload: ${payload}\n`);
  const ok = await pingIndexNow(payload);
  printGoogleNote();
  console.log(`  IndexNow : ${ok}/${INDEXNOW_ENDPOINTS.length} endpoint OK\n`);
  process.exit(ok > 0 ? 0 : 1);
}

main().catch(err => { console.error('Errore:', err); process.exit(1); });
