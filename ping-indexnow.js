#!/usr/bin/env node
/**
 * ping-indexnow.js — Script post-deploy
 * Invia un batch IndexNow a Bing (e altri motori) per notificare
 * gli aggiornamenti del sito ecura.it.
 *
 * Uso: node ping-indexnow.js
 * Oppure: INDEXNOW_KEY=xxx node ping-indexnow.js
 */

const KEY  = process.env.INDEXNOW_KEY || '60d8edebf9f2486d9f8d08e6d776215d';
const HOST = 'www.ecura.it';

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

const ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
  'https://search.seznam.cz/indexnow',
];

const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList: URLS,
});

async function pingAll() {
  console.log(`\n🚀 IndexNow ping — ${URLS.length} URLs verso ${ENDPOINTS.length} motori\n`);

  const results = await Promise.allSettled(
    ENDPOINTS.map(async (endpoint) => {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: payload,
      });
      const text = await res.text().catch(() => '').then(t => t.trim());
      const ok   = res.ok || res.status === 202;
      console.log(`  ${ok ? '✅' : '❌'} ${endpoint} → HTTP ${res.status}${text ? ' — ' + text.substring(0,80) : ''}`);
      return { endpoint, status: res.status, ok };
    })
  );

  const success = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
  console.log(`\n✅ ${success}/${ENDPOINTS.length} endpoint OK · ${URLS.length} URL inviate\n`);
  process.exit(success > 0 ? 0 : 1);
}

pingAll().catch(err => { console.error('Errore:', err); process.exit(1); });
