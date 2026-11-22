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

console.log(`\n${n} test OK`)
