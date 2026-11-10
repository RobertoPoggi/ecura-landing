// Test IndexNow (nessuna rete): validazione URL, protezione di /api/indexnow, scelta delle pagine modificate.
// Esecuzione: node tests/indexnow.test.mjs
import assert from 'node:assert/strict'
import { onRequest } from '../functions/api/indexnow.js'
import { validateUrls, INDEXNOW_KEY } from '../functions/_lib/indexnow.js'
import { sitemapUrls, urlForFile, urlsFromChangedFiles } from '../scripts/changed-urls.mjs'

let n = 0; const t = async (name, fn) => { await fn(); n++; console.log('ok  ' + name) }
const calls = []
globalThis.fetch = async (url, init) => { calls.push({ url: String(url), body: JSON.parse(init.body) }); return { ok: true, status: 200, text: async () => '' } }
const call = (method, { secret, urls = ['https://www.ecura.it/partner/'], env = { INDEXNOW_SECRET: 's3cret-di-prova' } } = {}) => {
  const headers = { 'Content-Type': 'application/json' }
  if (secret) headers['X-IndexNow-Secret'] = secret
  const u = 'https://www.ecura.it/api/indexnow' + (method === 'GET' ? '?' + (secret ? 'secret=' + secret + '&' : '') + urls.map(x => 'url=' + x).join('&') : '')
  return onRequest({ request: new Request(u, method === 'GET' ? { method } : { method, headers, body: JSON.stringify({ urls }) }), env })
}

await t('/api/indexnow: senza secret → 401, nessuna rete', async () => { calls.length = 0; assert.equal((await call('POST')).status, 401); assert.equal((await call('GET')).status, 401); assert.equal(calls.length, 0) })
await t('/api/indexnow: la chiave IndexNow (pubblica) NON è una credenziale → 401', async () => { calls.length = 0; assert.equal((await call('POST', { secret: INDEXNOW_KEY })).status, 401); assert.equal((await call('GET', { secret: INDEXNOW_KEY })).status, 401); assert.equal(calls.length, 0) })
await t('/api/indexnow: INDEXNOW_SECRET non configurato → 503 (nessun ripiego sulla chiave pubblica)', async () => { calls.length = 0; assert.equal((await call('POST', { secret: INDEXNOW_KEY, env: {} })).status, 503); assert.equal((await call('POST', { secret: INDEXNOW_KEY, env: { INDEXNOW_SECRET: '' } })).status, 503); assert.equal(calls.length, 0) })
await t('/api/indexnow: ADMIN_SECRET_TOKEN non è richiesto né accettato al posto di INDEXNOW_SECRET', async () => { assert.equal((await call('POST', { secret: 'admin-tok', env: { INDEXNOW_SECRET: 's3cret-di-prova', ADMIN_SECRET_TOKEN: 'admin-tok' } })).status, 401) })
await t('/api/indexnow: secret corretto → invia a entrambi gli endpoint con la chiave e il keyLocation', async () => {
  calls.length = 0; const r = await call('POST', { secret: 's3cret-di-prova' })
  assert.equal(r.status, 200); assert.equal(calls.length, 2)
  assert.ok(calls.some(c => c.url.includes('api.indexnow.org')) && calls.some(c => c.url.includes('bing.com')))
  assert.ok(calls.every(c => c.body.key === INDEXNOW_KEY && c.body.keyLocation === `https://www.ecura.it/${INDEXNOW_KEY}.txt` && c.body.host === 'www.ecura.it' && c.body.urlList[0] === 'https://www.ecura.it/partner/'))
})
await t('/api/indexnow: URL escluse da robots.txt o di altro host → 400 prima della rete', async () => {
  calls.length = 0
  for (const u of ['https://www.ecura.it/admin/', 'https://www.ecura.it/api/x', 'https://www.ecura.it/strategia-seo-link-building/', 'https://altro.it/']) assert.equal((await call('POST', { secret: 's3cret-di-prova', urls: [u] })).status, 400, u)
  assert.equal(calls.length, 0)
})
await t('validateUrls: da 1 a 100 URL, duplicati rimossi', () => {
  assert.equal(validateUrls([]).ok, false)
  assert.equal(validateUrls(Array.from({ length: 101 }, (_, i) => `https://www.ecura.it/p${i}/`)).ok, false)
  assert.deepEqual(validateUrls(['https://www.ecura.it/', 'https://www.ecura.it/']).urls, ['https://www.ecura.it/'])
})

const sm = sitemapUrls(`<urlset><url><loc>https://www.ecura.it/</loc><image:image><image:loc>https://www.ecura.it/img/a.jpg</image:loc></image:image></url><url><loc>https://www.ecura.it/partner/</loc></url><url><loc>https://www.ecura.it/privacy-policy/</loc></url></urlset>`)
await t('changed-urls: <loc> delle pagine, non <image:loc>', () => { assert.equal(sm.size, 3); assert.ok(!sm.has('https://www.ecura.it/img/a.jpg')) })
await t('changed-urls: file → URL', () => {
  assert.equal(urlForFile('public/index.html'), 'https://www.ecura.it/')
  assert.equal(urlForFile('public/partner/index.html'), 'https://www.ecura.it/partner/')
  assert.equal(urlForFile('public/blog/x/index.html'), 'https://www.ecura.it/blog/x/')
  assert.equal(urlForFile('public/css/style.css'), null); assert.equal(urlForFile('functions/api/indexnow.js'), null)
})
await t('changed-urls: solo pagine in sitemap (esclusi admin, grazie, 404, verifica Google)', () => {
  const files = ['public/index.html', 'public/partner/index.html', 'public/admin/index.html', 'public/grazie/index.html', 'public/404.html', 'public/googlef30ca6fbf46fcf5a.html', 'public/css/style.css', 'public/privacy-policy/index.html', 'public/index.html']
  assert.deepEqual(urlsFromChangedFiles(files, sm), ['https://www.ecura.it/', 'https://www.ecura.it/partner/', 'https://www.ecura.it/privacy-policy/'])
  assert.deepEqual(urlsFromChangedFiles(['public/css/style.css', 'functions/x.js'], sm), [])
})
console.log(`\n${n} test OK`)
