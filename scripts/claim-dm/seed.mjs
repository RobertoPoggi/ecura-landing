// Uso: node scripts/claim-dm/seed.mjs [--sql]   (legge docs/claim-dm/_private/claim_matrix_seed.json, NON scrive su nessun DB)
// Con --sql scrive docs/claim-dm/_private/seed.sql (gitignored) da applicare a mano dopo conferma:
//   npx wrangler d1 execute ecura-landing-db --remote --file docs/claim-dm/_private/seed.sql
import fs from 'node:fs';
import { estraiOriginali, costruisciRighe, generaSql, BLOCCHI_CON_TESTO } from './seed-lib.mjs';

const seedJson = JSON.parse(fs.readFileSync('docs/claim-dm/_private/claim_matrix_seed.json', 'utf8'));
const blocchiMap = JSON.parse(fs.readFileSync('functions/_lib/claim-blocchi.json', 'utf8'));
const manifest = fs.readFileSync('docs/claim-dm/snapshot-live-2026-11-22/MANIFEST.txt', 'utf8');
const originali = estraiOriginali('docs/claim-dm/snapshot-live-2026-11-22');
const rows = costruisciRighe({ seedJson, blocchiMap, originali, estrattoAt: '2026-11-22T00:00:00.000Z' });
void manifest;
console.log('Blocco  ORIGINALE(estratta)  TRANSITORIA  AUTORIZZATA   pagine');
for (const r of rows) console.log(r.block_id.padEnd(7), String(r.versione_originale.length).padStart(10), String(r.versione_transitoria.length).padStart(13), String(r.versione_autorizzata ? r.versione_autorizzata.length : 'NULL').padStart(12), '  ', JSON.parse(r.pagine).length);
const senza = BLOCCHI_CON_TESTO.filter(id => !originali[id]);
if (senza.length) console.log('\nATTENZIONE - ORIGINALE non estratta automaticamente per:', senza.join(', '), '(da definire prima di passare un blocco in stato ORIGINALE)');
if (process.argv.includes('--sql')) { fs.writeFileSync('docs/claim-dm/_private/seed.sql', generaSql(rows)); console.log('\nScritto docs/claim-dm/_private/seed.sql (non committato)'); }
