// Fase 0 — censimento dei claim DM per pagina, a partire dallo snapshot LIVE.
// Uso: node scripts/claim-dm/census.mjs [cartella-snapshot] > docs/claim-dm/CENSIMENTO.md
import fs from 'node:fs';
import path from 'node:path';

const DIR_DEFAULT = 'docs/claim-dm/snapshot-live-2026-11-22';
const RULES = [
  ['EC-01', 'claim hero / unicità', /unico servizio|l['’]unico|unico bracciale|\bsolo (?:eCura|bracciale)/i],
  ['EC-02', 'riferimenti al dispositivo (classe, BD/RDM, CND)', /classe\s*II\s?a|BD\/RDM|CND\s*V0399|banca dati|dispositivo medico|\bMDR\b|marcatura CE/i],
  ['EC-03', 'prezzi + markup Product/MedicalDevice', /"@type":\s*"(?:Product|MedicalDevice|Offer)"|"(?:priceCurrency|sku|mpn)"/i],
  ['EC-04', 'confronti nominativi', /Seremy|Beghelli|Salvalavita/i],
  ['EC-05', 'testimonial / valutazioni', /aggregateRating|ratingValue|"@type":\s*"Review"|recensioni verificate|★|&#9733;|stelle/i],
];
const META = /<title>|<meta[^>]+(?:name="description"|property="og:(?:title|description)"|name="twitter:(?:title|description)")|<img[^>]+alt="/i;
const CERT = /classe\s*II\s?a|BD\/RDM|CND|dispositivo medico|\bMDR\b|certificat|Seremy|Beghelli|unico/i;

export function analizza(dir = DIR_DEFAULT) {
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort();
const out = [];
const perPagina = {};
out.push('# Censimento claim DM (Fase 0)', '',
  `Generato da \`scripts/claim-dm/census.mjs\` sullo snapshot LIVE \`${dir}\`.`,
  'Le cifre sono occorrenze **per riga** (le pagine sono spesso su poche righe lunghe): servono a dimensionare il perimetro, non a sostituire la lettura umana.', '',
  '| Pagina | EC-01 | EC-02 | EC-03 | EC-04 | EC-05 | EC-06 (meta/alt con richiami) |', '|---|---:|---:|---:|---:|---:|---:|');
const detail = [];
for (const f of files) {
  const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
  const cnt = {}; const first = {};
  RULES.forEach(([id]) => { cnt[id] = 0; first[id] = []; });
  let ec06 = 0; const ec06l = [];
  lines.forEach((l, i) => {
    RULES.forEach(([id, , re]) => { if (re.test(l)) { cnt[id]++; if (first[id].length < 3) first[id].push(i + 1); } });
    if (META.test(l) && CERT.test(l)) { ec06++; if (ec06l.length < 3) ec06l.push(i + 1); }
  });
  const page = f === 'home.html' ? '/' : '/' + f.replace(/\.html$/, '').replace(/__/g, '/') + '/';
  perPagina[page] = { ...cnt, 'EC-06': ec06 };
  out.push(`| \`${page}\` | ${cnt['EC-01']} | ${cnt['EC-02']} | ${cnt['EC-03']} | ${cnt['EC-04']} | ${cnt['EC-05']} | ${ec06} |`);
  const tot = Object.values(cnt).reduce((a, b) => a + b, 0) + ec06;
  if (tot) detail.push(`- \`${page}\` — righe: ` + RULES.map(([id]) => cnt[id] ? `${id}: ${first[id].join(',')}` : null).filter(Boolean).concat(ec06 ? [`EC-06: ${ec06l.join(',')}`] : []).join(' · '));
}
out.push('', '## Prime righe interessate (nello snapshot)', '', ...detail, '');
return { markdown: out.join('\n'), perPagina };
}

import { fileURLToPath } from 'node:url';
if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(analizza(process.argv[2] || DIR_DEFAULT).markdown);
