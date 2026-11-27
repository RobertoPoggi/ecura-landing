// Test Fase 2-ter: cattura "ORIGINALE dal sito" (al primo giro vince il sito, poi vince D1). Template reali di public/, D1 simulato, nessuna rete.
// Esecuzione: node --no-warnings tests/claim-capture.test.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { nuovoDb } from './_d1-shim.mjs'
import * as R from '../functions/_lib/claim-render.js'
import * as C from '../functions/_lib/claim-capture.js'
import { PAGINE } from '../functions/_lib/claim-pagine.js'
import { onRequest as captureOriginale } from '../functions/internal/claim-blocks/capture-original.js'
import { applicaSeed, costruisciRighe, BLOCCHI_CON_TESTO } from '../scripts/claim-dm/seed-lib.mjs'

let n = 0; const t = async (name, fn) => { await fn(); n++; console.log('ok  ' + name) }
const NOW = new Date('2026-11-27T12:00:00.000Z')
const ago = m => new Date(NOW.getTime() - m * 60000).toISOString()
const fileDi = p => 'public' + p + 'index.html'
const leggi = p => fs.readFileSync(fileDi(p), 'utf8')
const mappa = JSON.parse(fs.readFileSync('functions/_lib/claim-blocchi.json', 'utf8'))
const REG = /<!--claim:(EC-\d{2})-->([\s\S]*?)<!--\/claim:\1-->/g
const regioniTemplate = {}
for (const p of Object.keys(PAGINE)) for (const m of leggi(p).matchAll(REG)) regioniTemplate[m[1]] = m[2]
const MAPPATI = ['EC-01', 'EC-03', 'EC-04', 'EC-05', 'EC-12']
const TRANS = Object.fromEntries(BLOCCHI_CON_TESTO.map(id => [id, id === 'EC-03' ? '<p>TRANS-PREZZI</p>' : id === 'EC-01' ? 'Titolo transitorio.\n\nSottotitolo transitorio.' : `<p>TRANS-${id}</p>`]))
const sintetico = { blocchi: BLOCCHI_CON_TESTO.map(id => ({ block_id: id, versione_transitoria: TRANS[id], versione_autorizzata: null })) }

// D1 con ORIGINALE = vecchio "snapshot 22/11" (diverso dal template: niente email_off, spazi diversi) oppure uguale al template.
const snapshotVecchio = Object.fromEntries(Object.entries(regioniTemplate).map(([id, h]) => [id, h.replace(/<!--\/?email_off-->/g, '') + '<!-- snap -->']))
const dbCon = async ({ orig = snapshotVecchio, stato = 'ORIGINALE' } = {}) => {
  const db = nuovoDb(['migrations/0010_claim_blocks.sql', 'migrations/0032_claim_formato_riferimento.sql'])
  await applicaSeed(db, costruisciRighe({ seedJson: sintetico, blocchiMap: mappa, originali: orig, estrattoAt: '2026-11-22T00:00:00.000Z' }), NOW)
  await db.prepare('UPDATE claim_blocks SET stato_replicato = ?, stato_replicato_at = ?').bind(stato, ago(5)).run()
  return db
}
const leggiPagina = async p => leggi(p)
const nRev = async db => (await db.prepare('SELECT COUNT(*) AS n FROM claim_blocks_revisions').first()).n
const orig = async (db, id) => (await db.prepare('SELECT versione_originale AS v FROM claim_blocks WHERE block_id = ?').bind(id).first()).v
const esiti = r => Object.fromEntries(r.blocchi.map(b => [b.block_id, b.esito]))
const assets = { fetch: async req => { const p = new URL(req.url).pathname; return PAGINE[p] ? new Response(leggi(p), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }) : new Response('nf', { status: 404 }) } }
const pagina = async (p, db) => (await R.renderPagina({ path: p, request: new Request('https://www.ecura.it' + p), env: { DB: db, ASSETS: assets }, now: NOW })).text()

await t('1. primo giro: D1 diventa il contenuto REALE del template (sovrascrive lo snapshot); EC-02/EC-06 non mappati; byte_prima/byte_dopo coerenti', async () => {
  const db = await dbCon()
  for (const id of MAPPATI) assert.notEqual(await orig(db, id), regioniTemplate[id])
  const r = await C.catturaOriginale(db, leggiPagina, { now: NOW })
  assert.equal(r.ok, true)
  const e = esiti(r)
  for (const id of MAPPATI) { assert.equal(e[id], 'aggiornato', id); assert.equal(await orig(db, id), regioniTemplate[id], id) }
  assert.equal(e['EC-02'], 'non_mappato'); assert.equal(e['EC-06'], 'non_mappato')
  const b1 = r.blocchi.find(b => b.block_id === 'EC-01')
  assert.equal(b1.byte_dopo, Buffer.byteLength(regioniTemplate['EC-01'])); assert.ok(b1.byte_prima > 0 && b1.byte_prima !== b1.byte_dopo)
  assert.ok(r.pagine.includes('/') && r.pagine.includes('/confronto-bracciali-anziani/') && r.pagine.includes('/guida-dispositivi-medici-teleassistenza/'))
  // gia' uguale al template -> 'invariato' fin dal primo giro
  const db2 = await dbCon({ orig: regioniTemplate })
  const r2 = await C.catturaOriginale(db2, leggiPagina, { now: NOW })
  for (const id of MAPPATI) assert.equal(esiti(r2)[id], 'invariato', id)
})

await t('2. secondo giro senza modifiche: tutti invariato, ZERO nuove revisioni, nessuna pagina da invalidare', async () => {
  const db = await dbCon()
  await C.catturaOriginale(db, leggiPagina, { now: NOW })
  const prima = await nRev(db)
  const snapshotDb = JSON.stringify((await db.prepare('SELECT * FROM claim_blocks ORDER BY block_id').all()).results)
  const r = await C.catturaOriginale(db, leggiPagina, { now: NOW })
  for (const id of MAPPATI) assert.equal(esiti(r)[id], 'invariato', id)
  assert.equal(await nRev(db), prima); assert.deepEqual(r.pagine, [])
  assert.equal(JSON.stringify((await db.prepare('SELECT * FROM claim_blocks ORDER BY block_id').all()).results), snapshotDb, 'nessuna scrittura')
  for (const b of r.blocchi.filter(b => MAPPATI.includes(b.block_id))) assert.equal(b.byte_prima, b.byte_dopo)
})

await t('3. template modificato: la cattura aggiorna D1, registra la revisione (autore/motivo/tipo) e marca il purge', async () => {
  const db = await dbCon({ orig: regioniTemplate })
  const modificata = async p => (p === '/confronto-bracciali-anziani/' ? leggi(p).replace('<!--/claim:EC-04-->', '<p>RIGA NUOVA NEL TEMPLATE</p><!--/claim:EC-04-->') : leggi(p))
  const prima = await nRev(db)
  const r = await C.catturaOriginale(db, modificata, { now: NOW })
  assert.equal(esiti(r)['EC-04'], 'aggiornato'); for (const id of MAPPATI.filter(x => x !== 'EC-04')) assert.equal(esiti(r)[id], 'invariato', id)
  assert.ok((await orig(db, 'EC-04')).endsWith('<p>RIGA NUOVA NEL TEMPLATE</p>'))
  assert.equal(await nRev(db), prima + 1)
  const rev = await db.prepare("SELECT * FROM claim_blocks_revisions WHERE tipo = 'sync_originale'").first()
  assert.equal(rev.block_id, 'EC-04'); assert.equal(rev.campo, 'versione_originale'); assert.equal(rev.autore, 'sistema/sync-originale')
  assert.equal(rev.motivo, 'Sincronizzazione ORIGINALE dal sito (primo giro o template modificato)')
  assert.equal(rev.testo_precedente, regioniTemplate['EC-04']); assert.ok(rev.testo_nuovo.includes('RIGA NUOVA'))
  assert.deepEqual(r.pagine, ['/confronto-bracciali-anziani/'])
  // endpoint: purge non configurato -> purge_pending acceso (mai passare inosservato)
  const db2 = await dbCon({ orig: regioniTemplate })
  const assetMod = { fetch: async req => new Response(await modificata(new URL(req.url).pathname), { status: 200 }) }
  const res = await captureOriginale({ request: new Request('https://www.ecura.it/internal/claim-blocks/capture-original', { method: 'POST', headers: { Authorization: 'Bearer tok' }, body: '{}' }), env: { DB: db2, ASSETS: assetMod, CLAIM_SYNC_TOKEN: 'tok' } })
  const j = await res.json(); assert.equal(res.status, 200); assert.equal(j.ok, true); assert.equal(j.purge.purged, false); assert.equal(j.purge_ok, false)
  assert.equal((await db2.prepare("SELECT valore FROM claim_config WHERE chiave='purge_pending'").first()).valore, '1')
  assert.ok(!JSON.stringify(j).includes('RIGA NUOVA'), 'la risposta non contiene testi')
})

await t('4. render: ORIGINALE serve il contenuto catturato = template (byte-identico); TRANSITORIA/AUTORIZZATA invariati rispetto a prima della cattura', async () => {
  const db = await dbCon()
  const prima = {}
  for (const st of ['TRANSITORIA', 'AUTORIZZATA']) { await db.prepare('UPDATE claim_blocks SET stato_replicato = ?').bind(st).run(); prima[st] = {}; for (const p of Object.keys(PAGINE)) prima[st][p] = await pagina(p, db) }
  await db.prepare("UPDATE claim_blocks SET stato_replicato = 'ORIGINALE'").run()
  // prima della cattura lo snapshot vecchio si vede (D1 != sito)
  assert.notEqual(await pagina('/', db), R.senzaMarcatori(leggi('/')))
  await C.catturaOriginale(db, leggiPagina, { now: NOW })
  for (const p of Object.keys(PAGINE)) assert.equal(await pagina(p, db), R.senzaMarcatori(leggi(p)), 'ORIGINALE = template: ' + p)
  for (const st of ['TRANSITORIA', 'AUTORIZZATA']) { await db.prepare('UPDATE claim_blocks SET stato_replicato = ?').bind(st).run(); for (const p of Object.keys(PAGINE)) assert.equal(await pagina(p, db), prima[st][p], `${st} invariata: ${p}`) }
  // fail-closed intatto: replica stale -> TRANSITORIA, mai ORIGINALE
  await db.prepare("UPDATE claim_blocks SET stato_replicato = 'ORIGINALE', stato_replicato_at = ?").bind(ago(60 * 30)).run()
  const stale = await pagina('/', db); assert.ok(stale.includes('TRANS-PREZZI') && !stale.includes(regioniTemplate['EC-03'].slice(0, 120)))
})

await t('5. auth: 401 senza/mal formato/errato, 503 senza segreto configurato (o vuoto), 405 per GET; nessuna scrittura', async () => {
  const db = await dbCon(); const prima = await nRev(db)
  const chiama = (headers, env = { CLAIM_SYNC_TOKEN: 'tok' }, method = 'POST') => captureOriginale({ request: new Request('https://www.ecura.it/internal/claim-blocks/capture-original', { method, headers, body: method === 'POST' ? '{}' : undefined }), env: { DB: db, ASSETS: assets, ...env } })
  assert.equal((await chiama({})).status, 401)
  assert.equal((await chiama({ Authorization: 'tok' })).status, 401)
  assert.equal((await chiama({ Authorization: 'Basic tok' })).status, 401)
  assert.equal((await chiama({ Authorization: 'Bearer ' })).status, 401)
  assert.equal((await chiama({ Authorization: 'Bearer sbagliato' })).status, 401)
  assert.equal((await chiama({ Authorization: 'Bearer tok' }, {})).status, 503)
  assert.equal((await chiama({ Authorization: 'Bearer ' }, { CLAIM_SYNC_TOKEN: '' })).status, 503)
  assert.equal((await chiama({ Authorization: 'Bearer tok' }, undefined, 'GET')).status, 405)
  assert.equal(await nRev(db), prima)
  const ok = await chiama({ Authorization: 'Bearer tok' }); assert.equal(ok.status, 200)
})

await t('6. EC-02 (nessuna regione): "non_mappato" senza errori, D1 intatto; con block_ids limita la cattura; block_ids non valido -> 400', async () => {
  const db = await dbCon(); const ec02 = await orig(db, 'EC-02'), ec06 = await orig(db, 'EC-06')
  const r = await C.catturaOriginale(db, leggiPagina, { now: NOW })
  assert.equal(r.ok, true); assert.equal(esiti(r)['EC-02'], 'non_mappato'); assert.equal(esiti(r)['EC-06'], 'non_mappato')
  assert.equal(await orig(db, 'EC-02'), ec02); assert.equal(await orig(db, 'EC-06'), ec06)
  assert.ok(!r.blocchi.some(b => b.esito === 'errore'))
  const db2 = await dbCon()
  const solo = await C.catturaOriginale(db2, leggiPagina, { now: NOW, blockIds: ['EC-01'] })
  assert.deepEqual(solo.blocchi.map(b => b.block_id), ['EC-01']); assert.equal(await orig(db2, 'EC-03'), snapshotVecchio['EC-03'])
  const res = await captureOriginale({ request: new Request('https://x/', { method: 'POST', headers: { Authorization: 'Bearer tok' }, body: JSON.stringify({ block_ids: ['../x'] }) }), env: { DB: db2, ASSETS: assets, CLAIM_SYNC_TOKEN: 'tok' } })
  assert.equal(res.status, 400)
})

await t('robustezza: non tocca stato, transitoria, autorizzata, provvedimento; marcatore mancante/pagina irraggiungibile -> esito "errore" (D1 intatto per quel blocco), mai eccezione', async () => {
  const db = await dbCon()
  await db.prepare("UPDATE claim_blocks SET versione_autorizzata = 'AUT', numero_provvedimento = 'N1', data_autorizzazione = '2026-01-02', stato_replicato = 'AUTORIZZATA'").run()
  const fotoAltri = JSON.stringify((await db.prepare('SELECT block_id, stato_replicato, stato_replicato_at, versione_transitoria, versione_autorizzata, numero_provvedimento, data_autorizzazione FROM claim_blocks ORDER BY block_id').all()).results)
  await C.catturaOriginale(db, leggiPagina, { now: NOW })
  assert.equal(JSON.stringify((await db.prepare('SELECT block_id, stato_replicato, stato_replicato_at, versione_transitoria, versione_autorizzata, numero_provvedimento, data_autorizzazione FROM claim_blocks ORDER BY block_id').all()).results), fotoAltri)
  const db2 = await dbCon(); const vecchio = await orig(db2, 'EC-12')
  const senzaMarker = async p => leggi(p).replace(/<!--\/?claim:EC-12-->/g, '')
  const r = await C.catturaOriginale(db2, senzaMarker, { now: NOW })
  assert.equal(r.ok, false); assert.equal(esiti(r)['EC-12'], 'errore'); assert.equal(await orig(db2, 'EC-12'), vecchio); assert.equal(esiti(r)['EC-01'], 'aggiornato')
  const r3 = await C.catturaOriginale(await dbCon(), async () => { throw new Error('asset giu') }, { now: NOW })
  assert.equal(r3.ok, false); assert.ok(r3.blocchi.filter(b => MAPPATI.includes(b.block_id)).every(b => b.esito === 'errore'))
  assert.throws(() => C.estraiRegioni('<!--claim:EC-01-->a<!--/claim:EC-01--><!--claim:EC-01-->b<!--/claim:EC-01-->'), /duplicata/)
})

await t('struttura: la rotta esiste, nessun testo di claim nel codice di cattura, blocchi mappati = PAGINE', () => {
  assert.ok(fs.existsSync('functions/internal/claim-blocks/capture-original.js'))
  const src = ['functions/_lib/claim-capture.js', 'functions/internal/claim-blocks/capture-original.js'].map(f => fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')).join('\n')
  assert.ok(!/Ministero della Salute|Classe\s*IIA|dispositivo medico|teleassistenza|H24/i.test(src))
  assert.deepEqual(Object.keys(C.blocchiMappati()).sort(), MAPPATI)
})
console.log(`\n${n} test OK`)
