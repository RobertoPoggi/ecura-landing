// Test di resolveCanale / first_referrer attraverso l'handler reale, con fetch finto (nessuna rete).
// Esecuzione: node tests/submit-lead.test.mjs
import assert from 'node:assert/strict'
import { onRequestPost } from '../functions/api/submit-lead.js'

let sent = null
globalThis.fetch = async (url, init) => {
  const u = String(url)
  if (u.includes('turnstile')) return { ok: true, status: 200, json: async () => ({ success: true }) }
  if (u.includes('/api/leads/public')) { sent = JSON.parse(init.body); return { ok: true, status: 200, json: async () => ({ success: true, id: 'L1' }) } }
  return { ok: true, status: 200, json: async () => ({}) }   // Google Sheet
}
const env = { TURNSTILE_SECRET_KEY: 'x', CRM_ENDPOINT: 'https://crm.test/api/leads/public', GSHEET_WEBHOOK_URL: 'https://sheet.test/exec' }
async function submit(extra) {
  sent = null
  const body = { full_name: 'Mario Rossi', phone: '3331234567', email: 'mario.rossi@gmail.com', privacy_consent: true, plan: 'PRO_BASE', ...extra }
  const res = await onRequestPost({ request: new Request('https://www.ecura.it/api/submit-lead', { method: 'POST', body: JSON.stringify(body) }), env, waitUntil() {} })
  assert.equal(res.status, 200); assert.ok(sent, 'il CRM deve ricevere il payload'); return sent
}
let n = 0; const t = async (name, fn) => { await fn(); n++; console.log('ok  ' + name) }

await t('B1: referrer chatgpt.com → AI', async () => { const p = await submit({ referrer: 'https://chatgpt.com/' }); assert.equal(p.canale_acquisizione, 'AI'); assert.equal(p.fonte_dettaglio, 'chatgpt.com') })
await t('B1: gemini.google.com/app → AI, NON ORGANICO', async () => { const p = await submit({ referrer: 'https://gemini.google.com/app' }); assert.equal(p.canale_acquisizione, 'AI'); assert.notEqual(p.canale_acquisizione, 'ORGANICO') })
for (const d of ['chat.openai.com', 'perplexity.ai', 'bard.google.com', 'copilot.microsoft.com', 'claude.ai', 'openai.com'])
  await t('B1: ' + d + ' → AI', async () => assert.equal((await submit({ referrer: 'https://' + d + '/x?y=1' })).canale_acquisizione, 'AI'))
await t('B1: google.com (ricerca) resta ORGANICO', async () => assert.equal((await submit({ referrer: 'https://www.google.com/' })).canale_acquisizione, 'ORGANICO'))
await t('B1: «chatgpt.com» solo nella query di Google non è AI', async () => assert.equal((await submit({ referrer: 'https://www.google.com/search?q=chatgpt.com' })).canale_acquisizione, 'ORGANICO'))
await t('B1: nessun referrer → DIRETTO; altro sito → REFERRAL', async () => {
  assert.equal((await submit({})).canale_acquisizione, 'DIRETTO')
  assert.equal((await submit({ referrer: 'https://blog.esempio.it/post' })).canale_acquisizione, 'REFERRAL')
})
await t('B2: dopo navigazione interna (referrer = ecura.it) first_referrer AI → AI e il CRM riceve il dominio', async () => {
  const p = await submit({ referrer: 'https://www.ecura.it/blog/', first_referrer: 'chatgpt.com' })
  assert.equal(p.canale_acquisizione, 'AI'); assert.equal(p.first_referrer, 'chatgpt.com')
})
await t('B2: first_referrer è ridotto al solo dominio (niente path, query, userinfo)', async () => {
  const p = await submit({ first_referrer: 'https://user:pw@www.Perplexity.ai/search?q=mario+rossi#x' })
  assert.equal(p.first_referrer, 'perplexity.ai'); assert.equal(p.canale_acquisizione, 'AI')
})
await t('B2: valori che non sono un dominio (email, testo) vengono scartati', async () => {
  assert.equal((await submit({ first_referrer: 'mario.rossi@gmail.com' })).first_referrer, null)
  assert.equal((await submit({ first_referrer: '<script>alert(1)</script>' })).first_referrer, null)
  assert.equal((await submit({ first_referrer: 'x'.repeat(300) + '.it' })).first_referrer, null)
})
await t('B2: first_referrer AI + utm_source → vince l\'UTM', async () => {
  const p = await submit({ first_referrer: 'chatgpt.com', utm_source: 'google', utm_medium: 'cpc' })
  assert.equal(p.canale_acquisizione, 'GOOGLE'); assert.equal(p.fonte_dettaglio, 'google_ads'); assert.equal(p.first_referrer, 'chatgpt.com')
  const q = await submit({ first_referrer: 'perplexity.ai', utm_source: 'newsletter', utm_medium: 'email' })
  assert.equal(q.canale_acquisizione, 'EMAIL')
})
await t('B2: first_referrer ha la precedenza sul referrer (ultima pagina)', async () => assert.equal((await submit({ referrer: 'https://www.google.com/', first_referrer: 'claude.ai' })).canale_acquisizione, 'AI'))
await t('B2: senza first_referrer il comportamento resta quello di prima', async () => { const p = await submit({ referrer: 'https://www.bing.com/' }); assert.equal(p.canale_acquisizione, 'ORGANICO'); assert.equal(p.first_referrer, null) })
await t('nessun dato personale aggiunto: il payload non contiene IP o user agent', async () => { const s = JSON.stringify(await submit({ first_referrer: 'chatgpt.com' })); assert.ok(!/user.?agent|remote.?ip|cf.?connecting/i.test(s)) })

// ── Browser: cattura first-touch e invio dopo navigazione interna (blocco estratto da ecura-consent.js) ──
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
const src = readFileSync(new URL('../public/js/ecura-consent.js', import.meta.url), 'utf8')
const block = src.slice(src.indexOf('/* first-touch:start'), src.indexOf('/* first-touch:end */'))
assert.ok(block.length > 100, 'blocco first-touch presente in ecura-consent.js')
function page(store, referrer, href) {
  const sessionStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v) } }
  const u = new URL(href); const ctx = { sessionStorage, document: { referrer }, location: { hostname: u.hostname, href }, URL, JSON }
  ctx.window = ctx; vm.runInNewContext(block, ctx); return ctx
}
await t('browser: arrivo da chatgpt.com → salvato {referrer, landing_url}; dopo pagina interna il form invia «chatgpt.com»', async () => {
  const store = {}
  page(store, 'https://chatgpt.com/c/abc?x=1', 'https://www.ecura.it/blog/articolo/')           // 1ª pagina
  const second = page(store, 'https://www.ecura.it/blog/articolo/', 'https://www.ecura.it/')     // navigazione interna
  const saved = JSON.parse(store.ecura_first_touch)
  assert.equal(saved.referrer, 'https://chatgpt.com/c/abc?x=1'); assert.equal(saved.landing_url, 'https://www.ecura.it/blog/articolo/')
  assert.equal(second.ecuraFirstReferrer(), 'chatgpt.com')
  const p = await submit({ referrer: 'https://www.ecura.it/blog/articolo/', first_referrer: second.ecuraFirstReferrer() })
  assert.equal(p.first_referrer, 'chatgpt.com'); assert.equal(p.canale_acquisizione, 'AI')
})
await t('browser: un referrer interno non viene salvato; il primo esterno non è sovrascritto da uno successivo', async () => {
  const a = {}; page(a, 'https://www.ecura.it/', 'https://www.ecura.it/x'); assert.equal(a.ecura_first_touch, undefined)
  const b = {}; page(b, 'https://claude.ai/', 'https://www.ecura.it/'); page(b, 'https://www.google.com/', 'https://www.ecura.it/y')
  assert.equal(JSON.parse(b.ecura_first_touch).referrer, 'https://claude.ai/')
})
await t('browser: accesso diretto (nessun referrer) → first_referrer vuoto', async () => { const s = {}; assert.equal(page(s, '', 'https://www.ecura.it/').ecuraFirstReferrer(), '') })
console.log(`\n${n} test OK`)
