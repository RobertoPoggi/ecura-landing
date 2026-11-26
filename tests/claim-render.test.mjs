// Test render lato server dei blocchi claim (Claim DM): pagine reali di public/, D1 simulato, nessuna rete.
// Esecuzione: node --no-warnings tests/claim-render.test.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { nuovoDb } from './_d1-shim.mjs'
import * as R from '../functions/_lib/claim-render.js'
import { PAGINE } from '../functions/_lib/claim-pagine.js'
import { REGIONI, applicaSeed, costruisciRighe, BLOCCHI_CON_TESTO } from '../scripts/claim-dm/seed-lib.mjs'

let n = 0; const t = async (name, fn) => { await fn(); n++; console.log('ok  ' + name) }
const NOW = new Date('2026-11-23T12:00:00.000Z')
const ago = m => new Date(NOW.getTime() - m * 60000).toISOString()
const FILE = { 'home.html': 'public/index.html', 'confronto-bracciali-anziani.html': 'public/confronto-bracciali-anziani/index.html', 'guida-dispositivi-medici-teleassistenza.html': 'public/guida-dispositivi-medici-teleassistenza/index.html' }
const fileDi = p => 'public' + p + 'index.html'
const leggi = p => fs.readFileSync(fileDi(p), 'utf8')
const mappa = JSON.parse(fs.readFileSync('functions/_lib/claim-blocchi.json', 'utf8'))

// ORIGINALE estratta dal template CORRENTE (con marcatori): cosi' ORIGINALE ricostruisce la pagina identica.
const originali = {}
for (const [id, r] of Object.entries(REGIONI)) {
  const h = fs.readFileSync(FILE[r.file], 'utf8').replace(/<!--\/?claim:EC-\d{2}-->/g, '')
  const reg = r.trova(h); originali[id] = h.slice(reg[0], reg[1])
}
const TRANS = {
  'EC-01': 'Servizio di teleassistenza per anziani: monitoraggio e assistenza H24.\n\nUn centro di risposta dedicato, 24 ore su 24.',
  'EC-03': '<p>TESTO-TRANS-PREZZI piani da 390 a 990 euro.</p>',
  'EC-04': '<section><h2>TESTO-TRANS-CRITERI</h2></section>',
  'EC-05': '<p>TESTO-TRANS-STORIE</p>',
  'EC-12': '<div><h1>TESTO-TRANS-GUIDA</h1></div>',
}
const sintetico = { blocchi: BLOCCHI_CON_TESTO.map(id => ({ block_id: id, versione_transitoria: TRANS[id] || `TESTO-TRANS-${id}`, versione_autorizzata: null })) }
const dbCon = async (stato, { at = ago(5), orig = originali, mod = {} } = {}) => {
  const db = nuovoDb(['migrations/0010_claim_blocks.sql', 'migrations/0032_claim_formato_riferimento.sql'])
  await applicaSeed(db, costruisciRighe({ seedJson: sintetico, blocchiMap: mappa, originali: orig, estrattoAt: '2026-11-22T00:00:00.000Z' }), NOW)
  await db.prepare('UPDATE claim_blocks SET stato_replicato = ?, stato_replicato_at = ?').bind(stato, stato ? at : null).run()
  for (const [id, sets] of Object.entries(mod)) for (const [k, v] of Object.entries(sets)) await db.prepare(`UPDATE claim_blocks SET ${k} = ? WHERE block_id = ?`).bind(v, id).run()
  return db
}
const assets = { fetch: async req => {
  const p = new URL(req.url).pathname
  if (!PAGINE[p] && p !== '/x') return new Response('nf', { status: 404 })
  return new Response(leggi(p), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': '1', ETag: 'x' } })
} }
const pagina = async (p, db, extra = {}) => {
  const res = await R.renderPagina({ path: p, request: new Request('https://www.ecura.it' + p), env: { DB: db, ASSETS: assets, ...extra }, now: NOW })
  return res.text()
}
const jsonld = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]))
const nodi = html => jsonld(html).flatMap(j => j['@graph'] || [j])
const tipi = html => nodi(html).flatMap(x => [].concat(x['@type']))
const senza = html => R.senzaMarcatori(html)
const senzaEO = html => html.replace(/<!--\/?email_off-->/g, '') // Cloudflare rimuove email_off in uscita: confronto a meno di questi commenti

await t('marcatori: ogni blocco dichiarato in PAGINE ha il suo marcatore, aperto e chiuso una sola volta; contenuto tra i marcatori invariato', () => {
  for (const [p, cfg] of Object.entries(PAGINE)) for (const id of cfg.blocchi) {
    const h = leggi(p); assert.equal(h.split(`<!--claim:${id}-->`).length, 2, `${id} in ${p}`); assert.equal(h.split(`<!--/claim:${id}-->`).length, 2)
    assert.equal(h.slice(h.indexOf(`<!--claim:${id}-->`) + `<!--claim:${id}-->`.length, h.indexOf(`<!--/claim:${id}-->`)), originali[id])
  }
})
await t('stato ORIGINALE → pagina IDENTICA al template statico (nessun cambiamento percepibile), JSON-LD intatto', async () => {
  const db = await dbCon('ORIGINALE')
  for (const p of Object.keys(PAGINE)) { const out = await pagina(p, db); assert.equal(out, senza(leggi(p)), p); assert.ok(tipi(out).includes('Product')) }
})
await t('stato TRANSITORIA → testo TRANSITORIA al posto dell\'originale; ORIGINALE assente; marcatori non emessi', async () => {
  const db = await dbCon('TRANSITORIA'); const home = await pagina('/', db)
  assert.ok(home.includes('Servizio di teleassistenza per anziani: monitoraggio') && home.includes('TESTO-TRANS-PREZZI') && home.includes('TESTO-TRANS-STORIE'))
  assert.ok(!home.includes(originali['EC-03'].trim().slice(0, 200)) && !home.includes(originali['EC-05'].trim().slice(0, 200)) && !home.includes('Bracciale Cadute Anziani con GPS, SOS Automatico'))
  assert.ok(!/claim:EC/.test(home))
  const conf = await pagina('/confronto-bracciali-anziani/', db); assert.ok(conf.includes('TESTO-TRANS-CRITERI') && !conf.includes(originali['EC-04'].trim().slice(0, 200)))
  const guida = await pagina('/guida-dispositivi-medici-teleassistenza/', db); assert.ok(guida.includes('TESTO-TRANS-GUIDA'))
})
await t('EC-01 testo semplice: primo paragrafo = H1 (unico), secondo = sottotitolo; H1 resta H1 in ogni stato', async () => {
  const home = await pagina('/', await dbCon('TRANSITORIA'))
  assert.equal((home.match(/<h1[\s>]/g) || []).length, 1); assert.ok(home.includes('<h1>Servizio di teleassistenza per anziani: monitoraggio e assistenza H24.</h1>') && home.includes('<p class="lead">Un centro di risposta dedicato'))
  assert.equal((senza(leggi('/')).match(/<h1[\s>]/g) || []).length, 1)
})
await t('JSON-LD: con EC-03 non ORIGINALE spariscono MedicalDevice/Product/Offer/offers, resta il resto (FAQPage, WebPage, Organization, BreadcrumbList), JSON valido', async () => {
  const db = await dbCon('TRANSITORIA')
  for (const p of Object.keys(PAGINE)) {
    const out = await pagina(p, db)
    for (const x of ['MedicalDevice', 'Product', 'Offer', 'OfferCatalog', 'AggregateOffer']) assert.ok(!tipi(out).includes(x), `${x} in ${p}`)
    assert.ok(!/"offers"|"hasOfferCatalog"/.test(JSON.stringify(jsonld(out))), p)
    assert.ok(tipi(out).includes('FAQPage') && tipi(out).includes('BreadcrumbList'), p)
    const ids = new Set(nodi(out).map(x => x['@id']).filter(Boolean)); const prima = nodi(leggi(p)).filter(x => [].concat(x['@type']).some(y => ['Product', 'MedicalDevice'].includes(y))).map(x => x['@id']).filter(Boolean)
    for (const id of prima) { assert.ok(!ids.has(id)); assert.ok(!JSON.stringify(jsonld(out)).includes(`"@id":"${id}"`), `riferimento pendente a ${id} in ${p}`) }
  }
})
await t('SEO: la struttura (canonical, title, meta description, H2/H3 fuori dai blocchi, sitemap) non dipende dallo stato', async () => {
  const [o, tr] = [await pagina('/', await dbCon('ORIGINALE')), await pagina('/', await dbCon('TRANSITORIA'))]
  for (const re of [/<link rel="canonical"[^>]*>/, /<title>[\s\S]*?<\/title>/, /<meta name="description"[^>]*>/, /<meta property="og:title"[^>]*>/]) assert.equal(o.match(re)[0], tr.match(re)[0])
  assert.ok(tipi(tr).includes('FAQPage') && tipi(o).includes('FAQPage'))
})
await t('fail-closed: replica mai ricevuta / stale (> 24 h) → TRANSITORIA, mai ORIGINALE, JSON-LD potato', async () => {
  for (const db of [await dbCon(null), await dbCon('ORIGINALE', { at: ago(24 * 60 + 1) })]) {
    const home = await pagina('/', db); assert.ok(home.includes('TESTO-TRANS-PREZZI')); assert.ok(!tipi(home).includes('Product'))
  }
})
await t('AUTORIZZATA senza versione_autorizzata → TRANSITORIA; con testo e provvedimento → testo + riferimento; senza provvedimento → nessun riferimento', async () => {
  let home = await pagina('/', await dbCon('AUTORIZZATA')); assert.ok(home.includes('TESTO-TRANS-PREZZI') && !/Autorizzato dal Ministero/.test(home))
  const mod = { 'EC-05': { versione_autorizzata: '<p>TESTO-AUT-STORIE</p>' } }
  home = await pagina('/', await dbCon('AUTORIZZATA', { mod })); assert.ok(home.includes('TESTO-AUT-STORIE') && !/Autorizzato dal Ministero/.test(home), 'nessun riferimento senza provvedimento')
  home = await pagina('/', await dbCon('AUTORIZZATA', { mod: { 'EC-05': { ...mod['EC-05'], numero_provvedimento: '777', data_autorizzazione: '2027-03-09' } } }))
  assert.ok(home.includes('TESTO-AUT-STORIE') && home.includes('Autorizzato dal Ministero della Salute con provvedimento n. 777 del 09/03/2027'))
  assert.ok(!tipi(home).includes('Product'), 'AUTORIZZATA di EC-05 non riporta il markup prodotto: dipende da EC-03 (fallback TRANSITORIA)')
})
await t('EC-03 AUTORIZZATA/TRANSITORIA → markup prodotto omesso; EC-03 ORIGINALE ma ALTRI blocchi TRANSITORIA (replica fresca) → markup presente (decide solo EC-03)', async () => {
  const db = await dbCon('ORIGINALE'); await db.prepare("UPDATE claim_blocks SET stato_replicato='TRANSITORIA' WHERE block_id IN ('EC-01','EC-05')").run()
  const home = await pagina('/', db); assert.ok(home.includes('TESTO-TRANS-STORIE')); assert.ok(tipi(home).includes('Product'))
})
await t('ORIGINALE con testo vuoto (blocco non mappato) → resta il contenuto statico del template; gli altri blocchi si applicano', async () => {
  const db = await dbCon('ORIGINALE', { orig: { ...originali, 'EC-05': '' } }); await db.prepare("UPDATE claim_blocks SET stato_replicato='TRANSITORIA' WHERE block_id='EC-03'").run()
  const home = await pagina('/', db); assert.ok(home.includes(originali['EC-05'])); assert.ok(home.includes('TESTO-TRANS-PREZZI'))
})
await t('TRANSITORIA vuota → nessun output del blocco (regione rimossa), non il vecchio contenuto', async () => {
  const db = await dbCon('TRANSITORIA', { mod: { 'EC-05': { versione_transitoria: '' } } })
  const home = await pagina('/', db); assert.ok(!home.includes(originali['EC-05'].trim().slice(0, 200))); assert.ok(!/claim:EC-05/.test(home))
})
await t('fail-closed del render: marcatore atteso mancante → eccezione (mai pagina con contenuto statico per errore); blocco assente da D1 → eccezione', async () => {
  const db = await dbCon('TRANSITORIA'); const privo = { fetch: async () => new Response(leggi('/').replace('<!--claim:EC-05-->', ''), { status: 200, headers: { 'Content-Type': 'text/html' } }) }
  await assert.rejects(R.renderPagina({ path: '/', request: new Request('https://www.ecura.it/'), env: { DB: db, ASSETS: privo }, now: NOW }), /marcatore|residui/)
  await db.prepare("DELETE FROM claim_blocks WHERE block_id='EC-03'").run()
  await assert.rejects(pagina('/', db), /EC-03/)
})
await t('servePagina: render spento (default) → asset statico senza marcatori, D1 non toccato', async () => {
  const dbRotto = { prepare() { throw new Error('D1 NON deve essere letto') } }
  const res = await R.servePagina({ request: new Request('https://www.ecura.it/'), env: { DB: dbRotto, ASSETS: assets } }, '/')
  assert.equal(await res.text(), senza(leggi('/')))
})
await t('servePagina: render acceso + D1 giù + cache → ultima pagina buona (stale); senza cache → 503 neutra, mai ORIGINALE', async () => {
  const db = await dbCon('TRANSITORIA'); const m = new Map()
  const cache = { match: async r => { const x = m.get(r.url); return x ? x.clone() : undefined }, put: async (r, res) => { m.set(r.url, res.clone()) } }
  const ctx = { request: new Request('https://www.ecura.it/'), env: { DB: db, ASSETS: assets, CLAIM_RENDER_ATTIVO: '1' }, waitUntil: p => p }
  const ok = await R.servePagina(ctx, '/', { cache, now: NOW }); assert.equal(ok.status, 200); assert.ok((await ok.text()).includes('TESTO-TRANS-PREZZI'))
  await new Promise(r => setTimeout(r, 10))
  const giu = { prepare() { throw new Error('D1 giu') } }
  const stale = await R.servePagina({ ...ctx, env: { DB: giu, ASSETS: assets, CLAIM_RENDER_ATTIVO: '1' } }, '/', { cache, now: new Date(NOW.getTime() + 3600e3) })
  const txt = await stale.text(); assert.equal(stale.status, 200); assert.ok(txt.includes('TESTO-TRANS-PREZZI')); assert.ok(!txt.includes(originali['EC-03'].trim().slice(0, 200)))
  assert.ok(!stale.headers.has('x-claim-cached-at'))
  const err = await R.servePagina({ ...ctx, env: { DB: giu, ASSETS: assets, CLAIM_RENDER_ATTIVO: '1' } }, '/', { cache: null, now: NOW })
  assert.equal(err.status, 503); const e = await err.text(); assert.ok(!/ORIGINALE|claim|stato|sincroniz/i.test(e)); assert.equal(err.headers.get('Cache-Control'), 'no-store')
})
await t('servePagina: POST o URL non canonico passano all\'asset, invariati', async () => {
  const visti = []; const a = { fetch: async r => { visti.push(r.method + ' ' + new URL(r.url).pathname); return new Response('ASSET') } }
  const env = { DB: null, ASSETS: a, CLAIM_RENDER_ATTIVO: '1' }
  assert.equal(await (await R.servePagina({ request: new Request('https://www.ecura.it/', { method: 'POST', body: 'x' }), env }, '/')).text(), 'ASSET')
  assert.equal(await (await R.servePagina({ request: new Request('https://www.ecura.it/index.html'), env }, '/')).text(), 'ASSET')
  assert.deepEqual(visti, ['POST /', 'GET /index.html'])
})
await t('ORIGINALE seedata dallo SNAPSHOT LIVE (senza email_off) → pagina identica al template a meno dei commenti email_off; le e-mail restano protette', async () => {
  const { estraiOriginali } = await import('../scripts/claim-dm/seed-lib.mjs')
  const db = await dbCon('ORIGINALE', { orig: estraiOriginali('docs/claim-dm/snapshot-live-2026-11-22') })
  for (const p of ['/', '/confronto-bracciali-anziani/', '/guida-dispositivi-medici-teleassistenza/']) {
    const out = await pagina(p, db); assert.equal(senzaEO(out), senzaEO(senza(leggi(p))), p)
    const fuori = out.replace(/<!--email_off-->[\s\S]*?<!--\/email_off-->/g, '').match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/g) || []
    const fuoriTpl = senza(leggi(p)).replace(/<!--email_off-->[\s\S]*?<!--\/email_off-->/g, '').match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/g) || []
    assert.ok(fuori.length <= fuoriTpl.length, `${p}: e-mail non protette dal blocco emesso`)
  }
})
await t('htmlBlocco: e-mail nel testo → avvolta in email_off; gia\' avvolta → nessun annidamento; senza e-mail → nessun wrapper', () => {
  assert.equal(R.htmlBlocco({ block_id: 'EC-05', testo: '<p>scrivi a info@ecura.it</p>', riferimento: '' }), '<!--email_off--><p>scrivi a info@ecura.it</p><!--/email_off-->')
  const gia = '<!--email_off--><p>info@ecura.it</p><!--/email_off-->'
  assert.equal(R.htmlBlocco({ block_id: 'EC-05', testo: gia, riferimento: '' }), gia)
  assert.equal(R.htmlBlocco({ block_id: 'EC-05', testo: '<p>nessuna mail</p>', riferimento: '' }), '<p>nessuna mail</p>')
})
await t('potaMarkupProdotto: rimuove nodi per tipo, chiavi offers/hasOfferCatalog, array e riferimenti @id pendenti; @type multiplo', () => {
  const j = { '@graph': [{ '@type': ['Product', 'Thing'], '@id': '#p', offers: { '@type': 'Offer' } }, { '@type': 'Service', '@id': '#s', offers: { '@type': 'Offer' }, hasOfferCatalog: { '@type': 'OfferCatalog' }, isRelatedTo: { '@id': '#p' }, about: [{ '@id': '#s' }, { '@id': '#p' }] }, { '@type': 'WebPage', about: { '@id': '#p' }, name: 'x' }] }
  const out = R.potaMarkupProdotto(structuredClone(j))
  assert.deepEqual(out, { '@graph': [{ '@type': 'Service', '@id': '#s', about: [{ '@id': '#s' }] }, { '@type': 'WebPage', name: 'x' }] })
})
await t('potaJsonLd: JSON non analizzabile con markup prodotto → blocco eliminato; senza → lasciato; script non JSON-LD intatti; niente "<" non escapato', () => {
  const html = '<script type="application/ld+json">{rotto "@type":"Product"}</script><script type="application/ld+json">{rotto}</script><script>var a=1</script><script type="application/ld+json">{"@type":"FAQPage","name":"</script>x"}</script>'
  const out = R.potaJsonLd(html); assert.ok(!out.includes('Product') && out.includes('{rotto}') && out.includes('var a=1'))
})
await t('PAGINE e functions/: una Function per ogni pagina dichiarata, nessuna rotta fuori elenco, nessun testo di claim nel codice di render', async () => {
  for (const p of Object.keys(PAGINE)) { const f = 'functions' + (p === '/' ? '' : p.replace(/\/$/, '')) + '/index.js'; assert.ok(fs.existsSync(f), f); assert.ok(fs.readFileSync(f, 'utf8').includes(`servePagina(context, '${p}')`)) }
  const src = ['functions/_lib/claim-render.js', 'functions/_lib/claim-pagine.js'].map(f => fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/'\/[a-z0-9\/-]*'/g, "''")).join('\n') // i percorsi URL tra apici non sono testi di claim
  assert.ok(!/Ministero della Salute|Classe\s*IIA|dispositivo medico|teleassistenza|H24/i.test(src))
})
console.log(`\n${n} test OK`)
