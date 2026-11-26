// Inserisce nei template (public/) i marcatori <!--claim:EC-XX--> ... <!--/claim:EC-XX--> attorno alle REGIONI dei blocchi.
// Idempotente. Il contenuto tra i marcatori NON cambia: a render spento (o blocco inerte) la pagina resta identica a prima.
// Uso: node scripts/claim-dm/inserisci-marker.mjs [--check]   (--check non scrive: esce 1 se mancano marcatori)
import fs from 'node:fs';
import { REGIONI } from './seed-lib.mjs';
import { PAGINE } from '../../functions/_lib/claim-pagine.js';

const FILE_PUBLIC = { 'home.html': 'public/index.html', 'confronto-bracciali-anziani.html': 'public/confronto-bracciali-anziani/index.html', 'guida-dispositivi-medici-teleassistenza.html': 'public/guida-dispositivi-medici-teleassistenza/index.html' };
const check = process.argv.includes('--check');
let mancanti = 0;
const perFile = {};
for (const [id, r] of Object.entries(REGIONI)) (perFile[FILE_PUBLIC[r.file]] ||= []).push([id, r]);
for (const [file, blocchi] of Object.entries(perFile)) {
  let html = fs.readFileSync(file, 'utf8'); let cambiato = false;
  for (const [id, r] of blocchi) {
    if (html.includes(`<!--claim:${id}-->`)) continue;
    const reg = r.trova(html); if (!reg) { console.error(`regione ${id} non trovata in ${file}`); mancanti++; continue; }
    if (check) { console.error(`marcatore ${id} mancante in ${file}`); mancanti++; continue; }
    html = html.slice(0, reg[0]) + `<!--claim:${id}-->` + html.slice(reg[0], reg[1]) + `<!--/claim:${id}-->` + html.slice(reg[1]); cambiato = true;
    console.log(`marcatore ${id} inserito in ${file}`);
  }
  if (cambiato) fs.writeFileSync(file, html);
}
// ogni blocco dichiarato in PAGINE deve avere il suo marcatore nel file
for (const [p, cfg] of Object.entries(PAGINE)) for (const id of cfg.blocchi) {
  const f = 'public' + p + 'index.html'; if (!fs.readFileSync(f, 'utf8').includes(`<!--claim:${id}-->`)) { console.error(`${id} dichiarato per ${p} ma senza marcatore`); mancanti++; }
}
process.exit(mancanti ? 1 : 0);
