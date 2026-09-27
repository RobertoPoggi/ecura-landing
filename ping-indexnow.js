#!/usr/bin/env node
/**
 * ping-indexnow.js — Script post-deploy eCura
 *
 * Notifica aggiornamenti a TUTTI i motori/agenti disponibili:
 *
 *  1. IndexNow batch  → Bing, Yandex, Seznam, Naver, Yep (api.indexnow.org relay)
 *  2. Google Sitemap ping → google.com/ping?sitemap=  (spinge Googlebot a recrawlare)
 *  3. Google News/Discover ping → news.google.com/ping  (stesso sitemap)
 *
 * Agenti AI (GPTBot/ChatGPT, ClaudeBot, PerplexityBot, Gemini, Grok, DuckDuckBot…)
 * NON espongono un endpoint di ping pubblico: scoprono i contenuti autonomamente
 * leggendo sitemap.xml e llms.txt — entrambi presenti su ecura.it.
 * Il ping Google sopra accelera anche questi bot perché molti si basano
 * sull'indice Google come fonte secondaria di discovery.
 *
 * Uso: node ping-indexnow.js
 *      INDEXNOW_KEY=xxx node ping-indexnow.js
 */

const KEY     = process.env.INDEXNOW_KEY || '60d8edebf9f2486d9f8d08e6d776215d';
const HOST    = 'www.ecura.it';

// ─── URL da notificare via IndexNow ────────────────────────────────────────
const URLS = [
  // Pagine principali
  `https://${HOST}/`,
  `https://${HOST}/confronto-bracciali-anziani/`,
  `https://${HOST}/bracciale-anziani-detraibile/`,
  `https://${HOST}/come-funziona-bracciale-ecura/`,
  `https://${HOST}/guida-cadute-anziani/`,
  `https://${HOST}/guida-dispositivi-medici-teleassistenza/`,
  `https://${HOST}/statistiche-cadute-anziani-italia/`,
  `https://${HOST}/partner/`,
  // Blog
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
  `https://${HOST}/blog/caregiver-distanza-genitori-anziani-estero/`,
];

// ─── IndexNow endpoints (Bing, Yandex, Seznam + relay → tutti gli altri) ───
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',   // relay → tutti i partner IndexNow
  'https://www.bing.com/indexnow',        // Bing diretto
  'https://yandex.com/indexnow',          // Yandex diretto
  'https://search.seznam.cz/indexnow',    // Seznam diretto
];

// ─── Google ─────────────────────────────────────────────────────────────────
// Google ha DEPRECATO il ping HTTP (google.com/ping?sitemap — restituisce 404).
// L'unica API programmatica è la Search Console API (OAuth 2.0 richiesto).
// Per notificare Google manualmente: Search Console → Ispezione URL → "Richiedi indicizzazione".
// Agenti AI (GPTBot, ClaudeBot, PerplexityBot, Gemini, Grok…) non hanno endpoint
// di ping pubblici: scoprono i contenuti da sitemap.xml e llms.txt autonomamente.

// ─── IndexNow batch payload ─────────────────────────────────────────────────
const indexnowPayload = JSON.stringify({
  host:        HOST,
  key:         KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList:     URLS,
});

// ─── Helpers ────────────────────────────────────────────────────────────────
async function pingIndexNow() {
  console.log(`\n━━━ 1/2  IndexNow — ${URLS.length} URL → ${INDEXNOW_ENDPOINTS.length} motori ━━━\n`);
  console.log(`  Motori coperti: Bing, Yandex, Seznam, Naver, Yep (via relay)\n`);

  const results = await Promise.allSettled(
    INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      const res  = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body:    indexnowPayload,
      });
      const text = await res.text().catch(() => '').then(t => t.trim());
      const ok   = res.ok || res.status === 202;
      console.log(`  ${ok ? '✅' : '❌'} ${endpoint.replace('https://', '')} → HTTP ${res.status}${text ? ' — ' + text.substring(0, 60) : ''}`);
      return { ok };
    })
  );

  return results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
}

async function pingGoogle() {
  console.log(`\n━━━ 2/2  Google ━━━\n`);
  console.log(`  ⚠️  Google ha deprecato il ping HTTP (google.com/ping?sitemap → 404).`);
  console.log(`  Per notificare Google usa Search Console manualmente:`);
  console.log(`  → https://search.google.com/search-console → Ispezione URL → "Richiedi indicizzazione"`);
  console.log(`  oppure invia il sitemap aggiornato nella sezione Sitemap di GSC.\n`);
  console.log(`  Gli agenti AI (GPTBot, ClaudeBot, PerplexityBot, Gemini, Grok…)`);
  console.log(`  non hanno endpoint di ping: scoprono i contenuti da sitemap.xml`);
  console.log(`  e llms.txt leggendo autonomamente in base alla propria cadenza.\n`);
  return 0; // nessun ping automatico possibile
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀  eCura — Full Search Ping  |  ${new Date().toLocaleString('it-IT')}`);
  console.log(`    Host: ${HOST}  |  ${URLS.length} URL\n`);

  const inOk = await pingIndexNow();
  await pingGoogle();

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  IndexNow : ${inOk}/${INDEXNOW_ENDPOINTS.length} endpoint OK`);
  console.log(`  Google   : manuale via Search Console (ping API deprecato)`);
  console.log(`\n  Motori/agenti notificati AUTOMATICAMENTE:`);
  console.log(`    ✅ Bing           (IndexNow diretto)`);
  console.log(`    ✅ Yandex         (IndexNow diretto)`);
  console.log(`    ✅ Seznam         (IndexNow diretto)`);
  console.log(`    ✅ Naver, Yep     (via api.indexnow.org relay)`);
  console.log(`\n  Motori/agenti da notificare MANUALMENTE:`);
  console.log(`    ⚠️  Google Search  → GSC: Ispezione URL → "Richiedi indicizzazione"`);
  console.log(`                        oppure GSC → Sitemap → aggiorna sitemap.xml`);
  console.log(`\n  Agenti AI (nessun ping disponibile, crawl autonomo):`);
  console.log(`    ⏳ GPTBot/ChatGPT (legge sitemap.xml e llms.txt)`);
  console.log(`    ⏳ ClaudeBot      (legge sitemap.xml e llms.txt)`);
  console.log(`    ⏳ PerplexityBot  (legge sitemap.xml e llms.txt)`);
  console.log(`    ⏳ Gemini-Crawl   (legge sitemap.xml e llms.txt)`);
  console.log(`    ⏳ Grok / xAI     (legge sitemap.xml e llms.txt)`);
  console.log(`${'─'.repeat(60)}\n`);

  process.exit((inOk > 0 || gOk > 0) ? 0 : 1);
}

main().catch(err => { console.error('Errore:', err); process.exit(1); });
