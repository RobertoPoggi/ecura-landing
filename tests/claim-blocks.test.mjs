// Test Claim DM (landing): catena di fallback, fail-closed, riferimento autorizzazione, revisioni, replica stato, health.
// Nessuna rete: D1 simulato con node:sqlite + migrazione reale. Esecuzione: node tests/claim-blocks.test.mjs
import assert from 'node:assert/strict'
import { nuovoDb } from './_d1-shim.mjs'
import * as L from '../functions/_lib/claim-blocks.js'
import { onRequest as sync } from '../functions/internal/claim-blocks/sync.js'
import { onRequest as health } from '../functions/internal/claim-blocks/health.js'
import { onRequest as purge } from '../functions/internal/claim-blocks/purge.js'

let n = 0; const t = async (name, fn) => { await fn(); n++; console.log('ok  ' + name) }
const NOW = new Date('2026-11-23T12:00:00.000Z')
const ago = (min) => new Date(NOW.getTime() - min * 60000).toISOString()
const row = (o = {}) => ({ block_id: 'EC-01', stato_replicato: 'ORIGINALE', stato_replicato_at: ago(5), versione_originale: 'TESTO-ORIG', versione_transitoria: 'TESTO-TRANS', versione_autorizzata: null, numero_provvedimento: null, data_autorizzazione: null, ...o })
const FMT = { formatoRiferimento: 'RIF n. {numero} del {data}' }
const TOK = 'tok-di-prova'

// ---- catena di fallback + stati (§6, test 4/5/6/7) ----
await t('ORIGINALE → versione_originale', () => assert.equal(L.risolviBlocco(row(), NOW).testo, 'TESTO-ORIG'))
await t('TRANSITORIA → versione_transitoria', () => assert.equal(L.risolviBlocco(row({ stato_replicato: 'TRANSITORIA' }), NOW).testo, 'TESTO-TRANS'))
await t('TRANSITORIA con testo vuoto o solo spazi → nessun output', () => {
  for (const v of ['', '   \n']) { const r = L.risolviBlocco(row({ stato_replicato: 'TRANSITORIA', versione_transitoria: v }), NOW); assert.equal(r.testo, ''); assert.equal(r.riferimento, '') }
})
await t('AUTORIZZATA con versione_autorizzata NULL → emette la TRANSITORIA (catena), non vuoto né misto', () => {
  const r = L.risolviBlocco(row({ stato_replicato: 'AUTORIZZATA' }), NOW)
  assert.equal(r.testo, 'TESTO-TRANS'); assert.equal(r.stato_effettivo, 'TRANSITORIA'); assert.equal(r.motivo_fallback, 'autorizzata_non_disponibile'); assert.equal(r.riferimento, '')
})
await t('AUTORIZZATA con autorizzata vuota ("") → catena su TRANSITORIA', () => assert.equal(L.risolviBlocco(row({ stato_replicato: 'AUTORIZZATA', versione_autorizzata: '' }), NOW).testo, 'TESTO-TRANS'))
await t('AUTORIZZATA e TRANSITORIA vuota → nessun output (mai ORIGINALE)', () => {
  const r = L.risolviBlocco(row({ stato_replicato: 'AUTORIZZATA', versione_transitoria: '' }), NOW); assert.equal(r.testo, ''); assert.ok(!r.testo.includes('ORIG'))
})
await t('AUTORIZZATA + provvedimento VUOTO → solo versione_autorizzata, nessun riferimento (anche con formato in D1)', () => {
  const r = L.risolviBlocco(row({ stato_replicato: 'AUTORIZZATA', versione_autorizzata: 'TESTO-AUT' }), NOW, FMT)
  assert.equal(r.testo, 'TESTO-AUT'); assert.equal(r.riferimento, '')
})
await t('AUTORIZZATA + solo numero (senza data) o solo data → nessun riferimento', () => {
  assert.equal(L.risolviBlocco(row({ stato_replicato: 'AUTORIZZATA', versione_autorizzata: 'A', numero_provvedimento: '123' }), NOW, FMT).riferimento, '')
  assert.equal(L.risolviBlocco(row({ stato_replicato: 'AUTORIZZATA', versione_autorizzata: 'A', data_autorizzazione: '2027-01-02' }), NOW, FMT).riferimento, '')
})
await t('AUTORIZZATA + provvedimento compilato → testo + riferimento con formato letto da D1', () => {
  const r = L.risolviBlocco(row({ stato_replicato: 'AUTORIZZATA', versione_autorizzata: 'TESTO-AUT', numero_provvedimento: ' 77/X ', data_autorizzazione: '2027-01-02' }), NOW, FMT)
  assert.equal(r.testo, 'TESTO-AUT'); assert.equal(r.riferimento, 'RIF n. 77/X del 02/01/2027')
})
await t('provvedimento compilato ma formato NON configurato → nessun riferimento (nessun testo hard-coded)', () => {
  assert.equal(L.risolviBlocco(row({ stato_replicato: 'AUTORIZZATA', versione_autorizzata: 'A', numero_provvedimento: '1', data_autorizzazione: '2027-01-02' }), NOW, {}).riferimento, '')
})

// ---- fail-closed (§6, test 3) ----
await t('replica mai ricevuta (null) → TRANSITORIA, mai ORIGINALE', () => {
  const r = L.risolviBlocco(row({ stato_replicato: null, stato_replicato_at: null }), NOW); assert.equal(r.stato_effettivo, 'TRANSITORIA'); assert.equal(r.testo, 'TESTO-TRANS'); assert.equal(r.motivo_fallback, 'replica_assente')
})
await t('replica più vecchia di 24 h con stato ORIGINALE → TRANSITORIA (stale)', () => {
  const r = L.risolviBlocco(row({ stato_replicato_at: ago(24 * 60 + 1) }), NOW); assert.equal(r.stato_effettivo, 'TRANSITORIA'); assert.equal(r.motivo_fallback, 'replica_stale')
})
await t('replica di 23 h 59 min → ancora fresca', () => assert.equal(L.risolviBlocco(row({ stato_replicato_at: ago(24 * 60 - 1) }), NOW).stato_effettivo, 'ORIGINALE'))
await t('replica stale con stato AUTORIZZATA → TRANSITORIA (non rimane il testo piu\' permissivo)', () => {
  const r = L.risolviBlocco(row({ stato_replicato: 'AUTORIZZATA', versione_autorizzata: 'A', stato_replicato_at: ago(3000) }), NOW); assert.equal(r.testo, 'TESTO-TRANS')
})
await t('stato o data corrotti/non ISO → fail-closed', () => {
  assert.equal(L.risolviBlocco(row({ stato_replicato: 'BOH' }), NOW).stato_effettivo, 'TRANSITORIA')
  assert.equal(L.risolviBlocco(row({ stato_replicato_at: 'ieri' }), NOW).stato_effettivo, 'TRANSITORIA')
  assert.equal(L.risolviBlocco(row({ stato_replicato_at: '2099-01-01T00:00:00Z' }), NOW).stato_effettivo, 'ORIGINALE') // futuro = non stale (clock skew), ma valido
})
await t('blocco inesistente → nessun output, TRANSITORIA', () => { const r = L.risolviBlocco(null, NOW); assert.equal(r.testo, ''); assert.equal(r.stato_effettivo, 'TRANSITORIA') })
await t('soglia di freschezza configurabile', () => assert.equal(L.risolviBlocco(row({ stato_replicato_at: ago(120) }), NOW, { freschezzaOre: 1 }).stato_effettivo, 'TRANSITORIA'))

// ---- D1: seeding di prova, revisioni, ripristino (test 8/11/12) ----
const nuovo = async () => {
  const db = nuovoDb()
  await db.prepare("INSERT INTO claim_blocks (block_id, titolo, pagine, versione_originale, versione_transitoria) VALUES ('EC-01','Hero','[\"/\"]','ORIG','TRANS'),('EC-03','Prezzi','[\"/\",\"/guida-cadute-anziani/\"]','O3','T3')").run()
  return db
}
await t('salvaBlocco: motivo obbligatorio → 400 e nessuna modifica', async () => {
  const db = await nuovo()
  for (const body of [{ versione_transitoria: 'X' }, { versione_transitoria: 'X', motivo: '  ' }]) { const r = await L.salvaBlocco(db, 'EC-01', body, 'mario', NOW); assert.equal(r.status, 400) }
  assert.equal((await db.prepare("SELECT versione_transitoria v FROM claim_blocks WHERE block_id='EC-01'").first()).v, 'TRANS')
  assert.equal((await db.prepare('SELECT COUNT(*) c FROM claim_blocks_revisions').first()).c, 0)
})
await t('salvaBlocco: una revisione per campo cambiato, con autore/motivo/testo precedente; i campi invariati non generano revisioni', async () => {
  const db = await nuovo()
  const r = await L.salvaBlocco(db, 'EC-01', { versione_transitoria: 'NUOVA', versione_originale: 'ORIG', motivo: 'rev consulente' }, 'mario', NOW)
  assert.deepEqual(r.cambiati, ['versione_transitoria'])
  const revs = (await db.prepare('SELECT * FROM claim_blocks_revisions').all()).results
  assert.equal(revs.length, 1); assert.equal(revs[0].testo_precedente, 'TRANS'); assert.equal(revs[0].testo_nuovo, 'NUOVA'); assert.equal(revs[0].autore, 'mario'); assert.equal(revs[0].motivo, 'rev consulente'); assert.equal(revs[0].tipo, 'modifica')
  assert.equal((await db.prepare("SELECT updated_by u, motivo m FROM claim_blocks WHERE block_id='EC-01'").first()).u, 'mario')
})
await t('salvaBlocco: nessuna modifica reale → nessuna revisione né purge', async () => {
  const db = await nuovo(); const r = await L.salvaBlocco(db, 'EC-01', { versione_transitoria: 'TRANS', motivo: 'x' }, 'm', NOW)
  assert.deepEqual(r.cambiati, []); assert.equal((await db.prepare('SELECT COUNT(*) c FROM claim_blocks_revisions').first()).c, 0)
})
await t('salvaBlocco: blocco inesistente → 404', async () => assert.equal((await L.salvaBlocco(await nuovo(), 'EC-99', { versione_transitoria: 'x', motivo: 'm' }, 'u', NOW)).status, 404))
await t('salvaBlocco: restituisce le pagine da invalidare (per il purge)', async () => {
  const r = await L.salvaBlocco(await nuovo(), 'EC-03', { versione_transitoria: 'Z', motivo: 'm' }, 'u', NOW); assert.deepEqual(r.pagine, ['/', '/guida-cadute-anziani/'])
})
await t('provvedimento vuoto accettato anche con AUTORIZZATA compilata (flag spento, default)', async () => {
  const db = await nuovo(); assert.equal((await L.salvaBlocco(db, 'EC-01', { versione_autorizzata: 'AUT', motivo: 'm' }, 'u', NOW)).ok, true)
})
await t('flag require_provvedimento_for_autorizzata=true → la validazione gira al salvataggio e blocca', async () => {
  const db = await nuovo(); await db.prepare("UPDATE claim_config SET valore='true' WHERE chiave='require_provvedimento_for_autorizzata'").run()
  const r = await L.salvaBlocco(db, 'EC-01', { versione_autorizzata: 'AUT', motivo: 'm' }, 'u', NOW); assert.equal(r.status, 400); assert.match(r.error, /numero_provvedimento/)
  assert.equal((await L.salvaBlocco(db, 'EC-01', { versione_autorizzata: 'AUT', numero_provvedimento: '1', data_autorizzazione: '2027-01-02', motivo: 'm' }, 'u', NOW)).ok, true)
})
await t('data_autorizzazione con formato errato → 400', async () => assert.equal((await L.salvaBlocco(await nuovo(), 'EC-01', { data_autorizzazione: '02/01/2027', motivo: 'm' }, 'u', NOW)).status, 400))
await t('ripristino: riporta il testo precedente, è a sua volta una revisione (tipo=ripristino) e richiede il motivo', async () => {
  const db = await nuovo()
  await L.salvaBlocco(db, 'EC-01', { versione_transitoria: 'V2', motivo: 'a' }, 'u1', NOW)
  await L.salvaBlocco(db, 'EC-01', { versione_transitoria: 'V3', motivo: 'b' }, 'u1', NOW)
  const revs = (await db.prepare('SELECT id, testo_precedente p FROM claim_blocks_revisions ORDER BY id').all()).results
  assert.equal((await L.ripristinaRevisione(db, 'EC-01', revs[1].id, '  ', 'u2', NOW)).status, 400)
  const r = await L.ripristinaRevisione(db, 'EC-01', revs[1].id, 'annullo V3', 'u2', NOW)   // prima della rev 2 il testo era V2
  assert.equal(r.ok, true)
  assert.equal((await db.prepare("SELECT versione_transitoria v FROM claim_blocks WHERE block_id='EC-01'").first()).v, 'V2')
  const last = await db.prepare('SELECT * FROM claim_blocks_revisions ORDER BY id DESC LIMIT 1').first()
  assert.equal(last.tipo, 'ripristino'); assert.equal(last.autore, 'u2'); assert.equal(last.motivo, 'annullo V3'); assert.equal(last.ripristina_revisione_id, revs[1].id)
  assert.equal((await db.prepare('SELECT COUNT(*) c FROM claim_blocks_revisions').first()).c, 3)
  assert.equal((await L.ripristinaRevisione(db, 'EC-01', 9999, 'm', 'u', NOW)).status, 404)
  assert.equal((await L.ripristinaRevisione(db, 'EC-03', revs[0].id, 'm', 'u', NOW)).status, 404) // revisione di un altro blocco
})

// ---- replica dello stato (test 1) ----
await t('applicaStato: scrive stato_replicato/at, esito "applicato" e pagine da purgare', async () => {
  const db = await nuovo(); const r = await L.applicaStato(db, { block_id: 'EC-01', stato: 'TRANSITORIA', updated_at: ago(1), motivo: 'go' }, 'webhook', NOW)
  assert.equal(r.esito, 'applicato'); assert.deepEqual(r.pagine, ['/'])
  const b = await db.prepare("SELECT * FROM claim_blocks WHERE block_id='EC-01'").first()
  assert.equal(b.stato_replicato, 'TRANSITORIA'); assert.equal(b.stato_replicato_at, NOW.toISOString()); assert.equal(b.stato_motivo, 'go')
})
await t('applicaStato: stesso stato → "invariato" ma rinfresca stato_replicato_at (alimenta health)', async () => {
  const db = await nuovo(); await L.applicaStato(db, { block_id: 'EC-01', stato: 'ORIGINALE', updated_at: ago(30) }, 'webhook', new Date(NOW.getTime() - 3600000))
  const r = await L.applicaStato(db, { block_id: 'EC-01', stato: 'ORIGINALE', updated_at: ago(30) }, 'riconciliazione', NOW)
  assert.equal(r.esito, 'invariato'); assert.equal(r.cambiato, false); assert.equal((await db.prepare("SELECT stato_replicato_at a FROM claim_blocks WHERE block_id='EC-01'").first()).a, NOW.toISOString())
})
await t('applicaStato: evento piu\' vecchio di quello gia\' applicato → "obsoleto", stato non cambia', async () => {
  const db = await nuovo(); await L.applicaStato(db, { block_id: 'EC-01', stato: 'TRANSITORIA', updated_at: ago(1) }, 'webhook', NOW)
  const r = await L.applicaStato(db, { block_id: 'EC-01', stato: 'ORIGINALE', updated_at: ago(60) }, 'webhook', NOW)
  assert.equal(r.esito, 'obsoleto'); assert.equal((await db.prepare("SELECT stato_replicato s FROM claim_blocks WHERE block_id='EC-01'").first()).s, 'TRANSITORIA')
})
await t('applicaStato: payload non valido o blocco sconosciuto → rifiutato, nessuna scrittura sul blocco', async () => {
  const db = await nuovo()
  for (const ev of [null, { block_id: 'XX', stato: 'ORIGINALE', updated_at: ago(1) }, { block_id: 'EC-01', stato: 'BOH', updated_at: ago(1) }, { block_id: 'EC-01', stato: 'ORIGINALE', updated_at: 'ieri' }]) assert.equal((await L.applicaStato(db, ev, 'webhook', NOW)).ok, false)
  assert.equal((await L.applicaStato(db, { block_id: 'EC-77', stato: 'ORIGINALE', updated_at: ago(1) }, 'webhook', NOW)).status, 404)
  assert.equal((await db.prepare("SELECT stato_replicato s FROM claim_blocks WHERE block_id='EC-01'").first()).s, null)
})

// ---- health (§2) ----
await t('health: mai sincronizzato → stale; dopo webhook → fresh; oltre 15 min → stale', async () => {
  const db = await nuovo()
  assert.equal((await L.calcolaHealth(db, NOW)).stato, 'stale')
  await L.applicaStato(db, { block_id: 'EC-01', stato: 'ORIGINALE', updated_at: ago(2) }, 'webhook', new Date(NOW.getTime() - 60000))
  const h = await L.calcolaHealth(db, NOW); assert.equal(h.stato, 'fresh'); assert.equal(h.minuti_dall_ultimo, 1); assert.deepEqual(h.blocchi_mai_sincronizzati, ['EC-03'])
  assert.equal((await L.calcolaHealth(db, new Date(NOW.getTime() + 16 * 60000))).stato, 'stale')
})
await t('health: blocchi in fail-closed elencati, nessun testo nel payload', async () => {
  const db = await nuovo(); const h = await L.calcolaHealth(db, NOW)
  assert.deepEqual(h.blocchi_in_fail_closed, ['EC-01', 'EC-03']); assert.ok(!JSON.stringify(h).includes('ORIG'))
})

// ---- endpoint /internal (autenticazione, test 12) ----
const call = (fn, { method = 'POST', token = TOK, body, env, path = '/internal/claim-blocks/sync' } = {}) => fn({
  request: new Request('https://www.ecura.it' + path, { method, headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }), env,
})
await t('/internal/*: senza token o token errato → 401; CLAIM_SYNC_TOKEN assente → 503 (nessun ripiego)', async () => {
  const db = await nuovo(); const env = { DB: db, CLAIM_SYNC_TOKEN: TOK }
  for (const fn of [sync, purge]) { assert.equal((await call(fn, { token: null, env })).status, 401); assert.equal((await call(fn, { token: 'sbagliato', env })).status, 401); assert.equal((await call(fn, { env: { DB: db } })).status, 503); assert.equal((await call(fn, { env: { DB: db, CLAIM_SYNC_TOKEN: '' } })).status, 503) }
  assert.equal((await call(health, { method: 'GET', token: null, env })).status, 401)
  assert.equal((await call(health, { method: 'GET', env: { DB: db } })).status, 503)
})
await t('/internal/*: metodo sbagliato → 405; risposte no-store e noindex', async () => {
  const env = { DB: await nuovo(), CLAIM_SYNC_TOKEN: TOK }
  const r = await call(sync, { method: 'GET', env }); assert.equal(r.status, 405)
  const h = await call(health, { method: 'GET', env }); assert.equal(h.status, 200); assert.equal(h.headers.get('Cache-Control'), 'no-store'); assert.match(h.headers.get('X-Robots-Tag'), /noindex/)
})
await t('/internal/claim-blocks/sync: replica e purge delle sole pagine del blocco (Cloudflare simulato)', async () => {
  const calls = []; const f0 = globalThis.fetch
  globalThis.fetch = async (u, init) => { calls.push({ u: String(u), body: JSON.parse(init.body) }); return { ok: true, status: 200 } }
  try {
    const db = await nuovo(); const env = { DB: db, CLAIM_SYNC_TOKEN: TOK, CF_ZONE_ID: 'zona1', CF_PURGE_TOKEN: 'cf-tok' }
    const r = await call(sync, { env, body: { block_id: 'EC-03', stato: 'TRANSITORIA', updated_at: new Date().toISOString(), motivo: 'go' } })
    const j = await r.json(); assert.equal(r.status, 200); assert.equal(j.esito, 'applicato'); assert.equal(j.purge.purged, true)
    assert.equal(calls.length, 1); assert.match(calls[0].u, /zones\/zona1\/purge_cache/)
    assert.deepEqual(calls[0].body.files.sort(), ['https://ecura.it/', 'https://ecura.it/guida-cadute-anziani/', 'https://www.ecura.it/', 'https://www.ecura.it/guida-cadute-anziani/'])
    // stesso stato di nuovo: nessun purge
    const r2 = await call(sync, { env, body: { block_id: 'EC-03', stato: 'TRANSITORIA', updated_at: new Date().toISOString() } }); assert.equal((await r2.json()).purge.motivo, 'stato_invariato'); assert.equal(calls.length, 1)
  } finally { globalThis.fetch = f0 }
})
await t('purge non configurato: la replica riesce comunque (il purge non è mai precondizione)', async () => {
  const env = { DB: await nuovo(), CLAIM_SYNC_TOKEN: TOK }
  const r = await call(sync, { env, body: { block_id: 'EC-01', stato: 'TRANSITORIA', updated_at: new Date().toISOString() } }); const j = await r.json()
  assert.equal(r.status, 200); assert.equal(j.purge.purged, false); assert.equal(j.purge.motivo, 'purge_non_configurato')
})
await t('/internal/claim-blocks/purge: invalida solo path censiti nei blocchi (no URL arbitrari)', async () => {
  const calls = []; const f0 = globalThis.fetch; globalThis.fetch = async (u, init) => { calls.push(JSON.parse(init.body)); return { ok: true, status: 200 } }
  try {
    const env = { DB: await nuovo(), CLAIM_SYNC_TOKEN: TOK, CF_ZONE_ID: 'z', CF_PURGE_TOKEN: 't' }
    await call(purge, { env, path: '/internal/claim-blocks/purge', body: { paths: ['/', '/admin/', '/qualsiasi/'] } })
    assert.deepEqual(calls[0].files.sort(), ['https://ecura.it/', 'https://www.ecura.it/'])
  } finally { globalThis.fetch = f0 }
})
await t('purgeUrls: errore di rete → non lancia', async () => {
  const r = await L.purgeUrls({ CF_ZONE_ID: 'z', CF_PURGE_TOKEN: 't' }, ['/'], async () => { throw new Error('rete giu') }); assert.equal(r.purged, false); assert.equal(r.motivo, 'errore_rete')
})

// ---- migrazione: nessun testo di claim inserito dalla migrazione ----
await t('migrazione 0010: crea le tabelle e non contiene testi di claim', async () => {
  const fs = await import('node:fs'); const sql = fs.readFileSync('migrations/0010_claim_blocks.sql', 'utf8')
  assert.ok(!/classe\s*IIa|BD\/RDM|Seremy|teleassistenza/i.test(sql.replace(/--.*$/gm, '')))
  const db = nuovoDb(); const nomi = db.raw.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name)
  for (const x of ['claim_blocks', 'claim_blocks_revisions', 'claim_config', 'claim_sync_log']) assert.ok(nomi.includes(x), x)
  assert.equal((await db.prepare('SELECT COUNT(*) c FROM claim_blocks').first()).c, 0)
})
// ---- nessun testo di claim nel codice ----
await t('codice di libreria ed endpoint: nessun testo di claim né di autorizzazione hard-coded', async () => {
  const fs = await import('node:fs'); const path = await import('node:path')
  const files = ['functions/_lib/claim-blocks.js', 'functions/_lib/claim-http.js', ...fs.readdirSync('functions/internal/claim-blocks').map(f => 'functions/internal/claim-blocks/' + f)]
  for (const f of files) { const s = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); assert.ok(!/Autorizzazione n|Ministero della Salute|provvedimento ministeriale|classe\s*IIa/i.test(s), f) }
})


// ---- test 15/16: stale-if-error (prompt integrativo §2) ----
const cacheFinta = () => { const m = new Map(); return { m, match: async r => { const x = m.get(new URL(r.url).pathname); return x ? x.clone() : undefined }, put: async (r, res) => { m.set(new URL(r.url).pathname, res.clone()) } } }
const req = new Request('https://www.ecura.it/')
const paginaCorrente = () => new Response('<html>VERSIONE-TRANSITORIA-CORRENTE</html>', { status: 200, headers: { 'Content-Type': 'text/html' } })
const d1Giu = async () => { throw new Error('D1 non raggiungibile') }
await t('15: D1 giù MA cache presente → pagina servita stale (la versione corrente, non quella piu\' permissiva)', async () => {
  const cache = cacheFinta(); const pend = []
  const a = await L.renderConStale(req, { render: async () => paginaCorrente(), cache, now: NOW, waitUntil: p => pend.push(p) }); await Promise.all(pend)
  assert.equal(a.origine, 'fresh')
  const b = await L.renderConStale(req, { render: d1Giu, cache, now: new Date(NOW.getTime() + 3600000) })
  assert.equal(b.origine, 'stale'); assert.equal(b.response.status, 200)
  const html = await b.response.text(); assert.match(html, /VERSIONE-TRANSITORIA-CORRENTE/); assert.ok(!/ORIG/.test(html))
  assert.equal(b.response.headers.get('x-claim-cached-at'), null)     // l'intestazione interna non esce mai
})
await t('15: con D1 giù scatta l\'allarme di health (replica non confermata) — nessun messaggio al pubblico', async () => {
  const db = await nuovo(); await L.applicaStato(db, { block_id: 'EC-01', stato: 'TRANSITORIA', updated_at: ago(40) }, 'webhook', new Date(NOW.getTime() - 40 * 60000))
  const h = await L.calcolaHealth(db, NOW); assert.equal(h.stato, 'stale'); assert.equal(h.allarme, true)
  const cache = cacheFinta(); await cache.put(req, paginaCorrente())
  const out = await L.renderConStale(req, { render: d1Giu, cache, now: NOW })
  const pubblico = await out.response.text(); assert.ok(!/sincroniz|alert|CRM|fail|stale/i.test(pubblico))
})
await t('16: D1 giù e NESSUNA cache → pagina di errore gestita (503, neutra), mai ORIGINALE', async () => {
  const out = await L.renderConStale(req, { render: d1Giu, cache: cacheFinta(), now: NOW })
  assert.equal(out.origine, 'errore'); assert.equal(out.response.status, 503)
  const html = await out.response.text()
  assert.ok(!/ORIG|classe\s*IIa|bracciale|claim|sincroniz|CRM/i.test(html)); assert.match(out.response.headers.get('Cache-Control'), /no-store/); assert.match(out.response.headers.get('X-Robots-Tag'), /noindex/)
})
await t('16: cache assente (cache=null) → pagina di errore, non eccezione', async () => assert.equal((await L.renderConStale(req, { render: d1Giu, cache: null, now: NOW })).origine, 'errore'))
await t('16: cache più vecchia della soglia (24 h) → non si serve: pagina di errore', async () => {
  const cache = cacheFinta(); const pend = []
  await L.renderConStale(req, { render: async () => paginaCorrente(), cache, now: NOW, waitUntil: p => pend.push(p) }); await Promise.all(pend)
  assert.equal((await L.renderConStale(req, { render: d1Giu, cache, now: new Date(NOW.getTime() + 25 * 3600000) })).origine, 'errore')
  assert.equal((await L.renderConStale(req, { render: d1Giu, cache, now: new Date(NOW.getTime() + 23 * 3600000) })).origine, 'stale')
})
await t('stale: le risposte non-200 non entrano mai in cache (una pagina d\'errore non diventa "ultima buona")', async () => {
  const cache = cacheFinta(); const pend = []
  await L.renderConStale(req, { render: async () => new Response('x', { status: 500 }), cache, now: NOW, waitUntil: p => pend.push(p) }); await Promise.all(pend)
  assert.equal(cache.m.size, 0)
})
await t('stale: errore nella lettura della cache → pagina di errore, non eccezione', async () => {
  const out = await L.renderConStale(req, { render: d1Giu, cache: { match: async () => { throw new Error('cache ko') }, put: async () => {} }, now: NOW }); assert.equal(out.origine, 'errore')
})

// ---- purge in sospeso: lo stale e' sicuro solo se la cache e' sempre stata invalidata ----
await t('purge fallito → purge_pending=1, health in allarme; il purge successivo invalida TUTTE le pagine e azzera', async () => {
  const db = await nuovo(); const env = { CF_ZONE_ID: 'z', CF_PURGE_TOKEN: 't' }
  const r1 = await L.purgeGestito(db, env, ['/'], async () => ({ ok: false, status: 500 }), NOW)
  assert.equal(r1.pending, true); assert.equal((await L.calcolaHealth(db, NOW)).purge_pending, true); assert.equal((await L.calcolaHealth(db, NOW)).allarme, true)
  let files = null
  const r2 = await L.purgeGestito(db, env, ['/'], async (u, init) => { files = JSON.parse(init.body).files; return { ok: true, status: 200 } }, NOW)
  assert.equal(r2.pending, false); assert.ok(files.includes('https://www.ecura.it/guida-cadute-anziani/'))   // anche le pagine di altri blocchi
  assert.equal((await L.calcolaHealth(db, NOW)).purge_pending, false)
})
await t('purge non configurato → resta in sospeso (non passa inosservato)', async () => {
  const db = await nuovo(); const r = await L.purgeGestito(db, {}, ['/'], fetch, NOW); assert.equal(r.pending, true)
})
await t('purge riuscito al primo colpo → nessuno stato in sospeso', async () => {
  const db = await nuovo(); const r = await L.purgeGestito(db, { CF_ZONE_ID: 'z', CF_PURGE_TOKEN: 't' }, ['/'], async () => ({ ok: true, status: 200 }), NOW); assert.equal(r.pending, false)
})

// ---- pubblicabilita' dei testi della matrice ----
await t('controllaPubblicabilita: segnala note SEO, etichette, segnaposti e istruzioni; testo pulito → nessun avviso', () => {
  assert.deepEqual(L.controllaPubblicabilita('Testo pulito per il pubblico.'), [])
  assert.ok(L.controllaPubblicabilita('(SEO: nota interna)').includes('nota_interna_seo'))
  assert.ok(L.controllaPubblicabilita('TEMA HERO — “Titolo”').includes('etichetta_di_struttura'))
  assert.ok(L.controllaPubblicabilita('provv. n. ___', 'versione_autorizzata').includes('segnaposto'))
  assert.ok(L.controllaPubblicabilita('Versione statica autorizzata con richiami', 'versione_autorizzata').includes('istruzione_non_testo'))
  assert.deepEqual(L.controllaPubblicabilita('', 'versione_autorizzata'), []); assert.deepEqual(L.controllaPubblicabilita(null), [])
})
await t('AUTORIZZATA che e\' un\'ISTRUZIONE o contiene un SEGNAPOSTO non si pubblica → catena su TRANSITORIA', () => {
  for (const aut of ['Versione statica autorizzata con i richiami obbligatori', 'Servizio autorizzato con provv. n. ___.']) {
    const r = L.risolviBlocco(row({ stato_replicato: 'AUTORIZZATA', versione_autorizzata: aut }), NOW)
    assert.equal(r.testo, 'TESTO-TRANS'); assert.equal(r.motivo_fallback, 'autorizzata_non_pubblicabile')
  }
  assert.equal(L.risolviBlocco(row({ stato_replicato: 'AUTORIZZATA', versione_autorizzata: 'Testo finale approvato.' }), NOW).testo, 'Testo finale approvato.')
})
await t('health: elenca i blocchi con testi non pubblicabili e quelli senza ORIGINALE', async () => {
  const db = await nuovo(); await db.prepare("UPDATE claim_blocks SET versione_transitoria='(SEO: x)', versione_originale='' WHERE block_id='EC-03'").run()
  const h = await L.calcolaHealth(db, NOW); assert.deepEqual(h.blocchi_con_testi_non_pubblicabili, ['EC-03']); assert.deepEqual(h.blocchi_senza_originale, ['EC-03'])
})

// ---- test 17: seeding (testo per testo, NULL, ORIGINALE da snapshot, idempotenza) ----
import fs from 'node:fs'
import { estraiOriginali, costruisciRighe, applicaSeed, generaSql, BLOCCHI_CON_TESTO } from '../scripts/claim-dm/seed-lib.mjs'
const SNAP = 'docs/claim-dm/snapshot-live-2026-11-22'
const mappa = JSON.parse(fs.readFileSync('functions/_lib/claim-blocchi.json', 'utf8'))
// Fixture sintetica (il JSON reale e' gitignored: in CI non c'e'). Contiene apostrofi, virgolette, a-capo e unicode per provare l'escaping.
const sintetico = { blocchi: [
  ...BLOCCHI_CON_TESTO.map((id, i) => ({ block_id: id, versione_transitoria: `Transitoria ${id}: l'unico \"servizio\"\nriga 2 — è così ✓`, versione_autorizzata: i === 0 ? '' : `Autorizzata ${id}: testo 'x' \"y\"` })),
  { block_id: 'EC-07', versione_transitoria: 'processo: non va importato', versione_autorizzata: 'processo' },
] }
const origSint = Object.fromEntries(BLOCCHI_CON_TESTO.map(id => [id, `ORIG-${id}`]))
const righe = (js, orig) => costruisciRighe({ seedJson: js, blocchiMap: mappa, originali: orig, estrattoAt: '2026-11-22T00:00:00.000Z' })
const dbVuoto = () => nuovoDb()
const conta = async (db, sql) => (await db.prepare(sql).first()).c

await t('17: seed — solo i blocchi con testo (EC-07..11 esclusi) e testi TRANSITORIA/AUTORIZZATA identici al JSON, testo per testo', async () => {
  const rows = righe(sintetico, origSint); const db = dbVuoto()
  assert.deepEqual(rows.map(r => r.block_id), BLOCCHI_CON_TESTO)
  await applicaSeed(db, rows, NOW)
  assert.equal(await conta(db, 'SELECT COUNT(*) c FROM claim_blocks'), BLOCCHI_CON_TESTO.length)
  assert.equal(await conta(db, "SELECT COUNT(*) c FROM claim_blocks WHERE block_id IN ('EC-07','EC-08','EC-09','EC-10','EC-11')"), 0)
  for (const b of sintetico.blocchi.filter(b => BLOCCHI_CON_TESTO.includes(b.block_id))) {
    const r = await db.prepare('SELECT * FROM claim_blocks WHERE block_id = ?').bind(b.block_id).first()
    assert.equal(r.versione_transitoria, b.versione_transitoria, 'transitoria ' + b.block_id)
    assert.equal(r.versione_autorizzata, b.versione_autorizzata === '' ? null : b.versione_autorizzata, 'autorizzata ' + b.block_id)
  }
})
await t('17: seed — numero_provvedimento e data_autorizzazione NULL, stato replicato NULL (fail-closed), ORIGINALE dall\'estratto', async () => {
  const db = dbVuoto(); await applicaSeed(db, righe(sintetico, origSint), NOW)
  const { results } = await db.prepare('SELECT * FROM claim_blocks').all()
  for (const r of results) {
    assert.equal(r.numero_provvedimento, null); assert.equal(r.data_autorizzazione, null); assert.equal(r.stato_replicato, null)
    assert.equal(r.versione_originale, 'ORIG-' + r.block_id)
    assert.equal(L.risolviBlocco(r, NOW).stato_effettivo, 'TRANSITORIA', 'senza replica: mai ORIGINALE')
  }
})
await t('17: seed — una revisione di tipo seed per ogni campo non vuoto; AUTORIZZATA vuota non genera revisione', async () => {
  const db = dbVuoto(); await applicaSeed(db, righe(sintetico, origSint), NOW)
  const attese = BLOCCHI_CON_TESTO.length * 3 - 1 // EC-01 senza autorizzata
  assert.equal(await conta(db, "SELECT COUNT(*) c FROM claim_blocks_revisions WHERE tipo='seed'"), attese)
  assert.equal(await conta(db, "SELECT COUNT(*) c FROM claim_blocks_revisions WHERE block_id='EC-01' AND campo='versione_autorizzata'"), 0)
})
await t('17: re-seed idempotente — nessun blocco né revisione duplicati, modifiche fatte in admin non sovrascritte', async () => {
  const db = dbVuoto(); const rows = righe(sintetico, origSint)
  await applicaSeed(db, rows, NOW)
  await L.salvaBlocco(db, 'EC-02', { versione_transitoria: 'MODIFICATA IN ADMIN', motivo: 'revisione consulente' }, 'mario', NOW)
  const rev0 = await conta(db, 'SELECT COUNT(*) c FROM claim_blocks_revisions')
  const esito = await applicaSeed(db, rows, NOW)
  assert.deepEqual(esito.inseriti, []); assert.equal(esito.gia_presenti.length, BLOCCHI_CON_TESTO.length)
  assert.equal(await conta(db, 'SELECT COUNT(*) c FROM claim_blocks_revisions'), rev0)
  assert.equal((await db.prepare("SELECT versione_transitoria v FROM claim_blocks WHERE block_id='EC-02'").first()).v, 'MODIFICATA IN ADMIN')
})
await t('17: seed SQL generato — identico al seed applicativo, escaping corretto, eseguito due volte non duplica', async () => {
  const rows = righe(sintetico, origSint); const sql = generaSql(rows, NOW)
  const a = dbVuoto(); a.raw.exec(sql); a.raw.exec(sql)
  assert.equal(await conta(a, 'SELECT COUNT(*) c FROM claim_blocks'), BLOCCHI_CON_TESTO.length)
  assert.equal(await conta(a, 'SELECT COUNT(*) c FROM claim_blocks_revisions'), BLOCCHI_CON_TESTO.length * 3 - 1)
  const b = dbVuoto(); await applicaSeed(b, rows, NOW)
  const dump = async d => JSON.stringify((await d.prepare('SELECT block_id, titolo, pagine, stato_replicato, versione_originale, versione_transitoria, versione_autorizzata, numero_provvedimento, data_autorizzazione FROM claim_blocks ORDER BY block_id').all()).results)
  assert.equal(await dump(a), await dump(b))
  const r = await a.prepare("SELECT versione_transitoria v FROM claim_blocks WHERE block_id='EC-03'").first()
  assert.equal(r.v, sintetico.blocchi.find(x => x.block_id === 'EC-03').versione_transitoria)
})
await t('17: ORIGINALE dallo snapshot live — estratta per i blocchi estraibili, mai da \"elemento_originale_rilevato\"', () => {
  const o = estraiOriginali(SNAP)
  for (const id of ['EC-01', 'EC-03', 'EC-04', 'EC-05', 'EC-06', 'EC-12']) assert.ok(o[id] && o[id].length > 100, 'ORIGINALE ' + id)
  assert.ok(!o['EC-02'], 'EC-02: nessuna regione unica, da mappare a mano (resta vuota, non inventata)')
  const js = { blocchi: BLOCCHI_CON_TESTO.map(id => ({ block_id: id, elemento_originale_rilevato: 'CITAZIONE-DA-NON-USARE', versione_transitoria: 't', versione_autorizzata: null })) }
  for (const r of righe(js, o)) assert.ok(!r.versione_originale.includes('CITAZIONE-DA-NON-USARE'))
})
await t('17: mappatura blocchi→pagine (corretta 22/11): nessuna pagina /blog/*, EC-04 = solo confronto, EC-12 = solo guida dispositivi, pagine esistenti in public/', () => {
  for (const id of BLOCCHI_CON_TESTO) {
    const m = mappa.blocchi[id]; assert.ok(m && m.titolo && m.pagine.length > 0, id)
    for (const p of m.pagine) {
      assert.ok(!p.startsWith('/blog'), `${id}: gli articoli blog sono D1/admin, non blocchi claim (${p})`)
      assert.ok(fs.existsSync('public' + (p.endsWith('/') ? p + 'index.html' : p)), `${id}: pagina inesistente in public/: ${p}`)
    }
  }
  assert.deepEqual(mappa.blocchi['EC-04'].pagine, ['/confronto-bracciali-anziani/'])
  assert.deepEqual(mappa.blocchi['EC-12'].pagine, ['/guida-dispositivi-medici-teleassistenza/'])
  // EC-03 (JSON-LD Product/MedicalDevice/Offer): deve coprire ogni pagina pubblica con quel markup, altrimenti il purge ne dimentica una
  for (const p of mappa.blocchi['EC-03'].pagine.concat(['/'])) assert.ok(mappa.blocchi['EC-03'].pagine.includes(p))
  const conMarkup = ['/', '/bracciale-anziani-detraibile/', '/come-funziona-bracciale-ecura/', '/confronto-bracciali-anziani/', '/guida-cadute-anziani/', '/guida-dispositivi-medici-teleassistenza/', '/recensioni-ecura-seremy-beghelli/']
  for (const p of conMarkup) {
    const h = fs.readFileSync('public' + (p.endsWith('/') ? p + 'index.html' : p), 'utf8')
    if (/"@type":\s*"(?:Product|MedicalDevice)"/.test(h)) assert.ok(mappa.blocchi['EC-03'].pagine.includes(p), 'EC-03 deve includere ' + p)
  }
})
const PRIV = 'docs/claim-dm/_private/claim_matrix_seed.json'
const PRIV_JSON = PRIV
if (fs.existsSync(PRIV)) {
  await t('17 (locale, JSON reale): TRANSITORIA/AUTORIZZATA nel D1 = testo per testo del file della matrice; provvedimento NULL', async () => {
    const js = JSON.parse(fs.readFileSync(PRIV, 'utf8')); const db = dbVuoto()
    await applicaSeed(db, righe(js, estraiOriginali(SNAP)), NOW)
    for (const b of js.blocchi.filter(b => BLOCCHI_CON_TESTO.includes(b.block_id))) {
      const r = await db.prepare('SELECT * FROM claim_blocks WHERE block_id = ?').bind(b.block_id).first()
      assert.equal(r.versione_transitoria, b.versione_transitoria ?? ''); assert.equal(r.versione_autorizzata, b.versione_autorizzata || null)
      assert.equal(r.numero_provvedimento, null); assert.equal(r.data_autorizzazione, null)
    }
    assert.equal(await conta(db, "SELECT COUNT(*) c FROM claim_blocks WHERE block_id IN ('EC-07','EC-08','EC-09','EC-10','EC-11')"), 0)
  })
} else console.log('--  17 (JSON reale) saltato: file privato assente (atteso in CI)')

// ---- regola 22/11: ORIGINALE con testo vuoto => il blocco non sostituisce nulla (contenuto statico del template intatto) ----
await t('ORIGINALE con testo vuoto → contenuto statico intatto (statico=true, nessun testo, nessun riferimento)', () => {
  for (const v of ['', '   \n']) {
    const r = L.risolviBlocco(row({ block_id: 'EC-02', versione_originale: v }), NOW)
    assert.equal(r.stato_effettivo, 'ORIGINALE'); assert.equal(r.statico, true); assert.equal(r.testo, ''); assert.equal(r.riferimento, '')
  }
})
await t('ORIGINALE con testo → sostituisce (statico=false); TRANSITORIA vuota NON e\' statico (nessun output, non il vecchio contenuto)', () => {
  assert.equal(L.risolviBlocco(row(), NOW).statico, false)
  const r = L.risolviBlocco(row({ stato_replicato: 'TRANSITORIA', versione_transitoria: '', versione_originale: '' }), NOW)
  assert.equal(r.statico, false); assert.equal(r.testo, '')
})
await t('ORIGINALE vuota + replica stale/assente → TRANSITORIA (mai statico = mai il contenuto originale per default)', () => {
  for (const o of [{ stato_replicato: null, stato_replicato_at: null }, { stato_replicato_at: ago(24 * 60 + 1) }]) {
    const r = L.risolviBlocco(row({ versione_originale: '', ...o }), NOW); assert.equal(r.stato_effettivo, 'TRANSITORIA'); assert.equal(r.statico, false); assert.equal(r.testo, 'TESTO-TRANS')
  }
})
await t('EC-02 inerte: seed senza ORIGINALE → blocco statico finche\' non mappato; dopo la mappatura (admin) sostituisce', async () => {
  const db = dbVuoto(); await applicaSeed(db, righe(sintetico, { ...origSint, 'EC-02': '' }), NOW)
  await db.prepare("UPDATE claim_blocks SET stato_replicato='ORIGINALE', stato_replicato_at=?").bind(ago(1)).run()
  const tutti = await L.risolviTutti(db, NOW)
  assert.equal(tutti['EC-02'].statico, true); assert.equal(tutti['EC-02'].testo, '')
  assert.equal(tutti['EC-03'].statico, false); assert.equal(tutti['EC-03'].testo, 'ORIG-EC-03')
})

// ---- riferimento all'autorizzazione: formato da claim_config (migrazione 0032), gg/mm/aaaa, solo con entrambi i campi ----
const FMT_REALE = 'Autorizzato dal Ministero della Salute con provvedimento n. {numero_provvedimento} del {data_autorizzazione}'
await t('0032: formato del riferimento in claim_config (valore di configurazione, non nel codice); non sovrascrive un valore gia\' impostato', async () => {
  const db = nuovoDb(['migrations/0010_claim_blocks.sql', 'migrations/0032_claim_formato_riferimento.sql'])
  assert.equal((await L.leggiConfig(db)).formatoRiferimento, FMT_REALE)
  const db2 = nuovoDb(['migrations/0010_claim_blocks.sql']); await db2.prepare("UPDATE claim_config SET valore='MIO {numero}' WHERE chiave='formato_riferimento_autorizzazione'").run()
  db2.raw.exec(fs.readFileSync('migrations/0032_claim_formato_riferimento.sql', 'utf8'))
  assert.equal((await L.leggiConfig(db2)).formatoRiferimento, 'MIO {numero}')
})
await t('riferimento: segnaposti {numero_provvedimento}/{data_autorizzazione}, data gg/mm/aaaa, solo con ENTRAMBI i campi', () => {
  const f = { formatoRiferimento: FMT_REALE }; const a = { stato_replicato: 'AUTORIZZATA', versione_autorizzata: 'AUT' }
  assert.equal(L.risolviBlocco(row({ ...a, numero_provvedimento: '12345', data_autorizzazione: '2027-03-09' }), NOW, f).riferimento, 'Autorizzato dal Ministero della Salute con provvedimento n. 12345 del 09/03/2027')
  for (const o of [{ numero_provvedimento: '12345' }, { data_autorizzazione: '2027-03-09' }, { numero_provvedimento: ' ', data_autorizzazione: '2027-03-09' }, {}]) assert.equal(L.risolviBlocco(row({ ...a, ...o }), NOW, f).riferimento, '', JSON.stringify(o))
})

// ---- EC-01 TRANSITORIA ripulita (voce 6 del 22/11): il seed resta fedele al JSON, la versione pulita si applica in admin ----
const EC01_PULITA = 'docs/claim-dm/_private/EC-01_transitoria_ripulita.txt'
if (fs.existsSync(EC01_PULITA)) {
  await t('EC-01 TRANSITORIA ripulita (locale): nessun avviso di pubblicabilita\'; due paragrafi; applicata in admin registra la correzione come revisione', async () => {
    const testo = fs.readFileSync(EC01_PULITA, 'utf8').trim()
    assert.deepEqual(L.controllaPubblicabilita(testo, 'versione_transitoria'), [])
    assert.equal(testo.split(/\n\s*\n/).length, 2)
    const db = dbVuoto(); await applicaSeed(db, righe(JSON.parse(fs.readFileSync(PRIV_JSON, 'utf8')), estraiOriginali(SNAP)), NOW)
    assert.ok(L.controllaPubblicabilita((await db.prepare("SELECT versione_transitoria v FROM claim_blocks WHERE block_id='EC-01'").first()).v).length > 0, 'prima della pulizia il seed e\' segnalato')
    const r = await L.salvaBlocco(db, 'EC-01', { versione_transitoria: testo, motivo: 'Pulizia: rimosse etichette/note interne della matrix' }, 'mario', NOW)
    assert.equal(r.ok, true)
    const rev = await db.prepare("SELECT testo_precedente p, testo_nuovo n, tipo FROM claim_blocks_revisions WHERE block_id='EC-01' AND campo='versione_transitoria' ORDER BY id DESC LIMIT 1").first()
    assert.equal(rev.tipo, 'modifica'); assert.equal(rev.n, testo); assert.ok(rev.p.includes('TEMA HERO'))
    assert.equal(L.avvisiBlocco(await db.prepare("SELECT * FROM claim_blocks WHERE block_id='EC-01'").first()).versione_transitoria, undefined)
  })
}

console.log(`\n${n} test OK`)
