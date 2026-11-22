// Genera functions/_lib/claim-blocchi.json (titolo + pagine per blocco) dal censimento dello snapshot live.
// E' una PROPOSTA di mappatura blocco -> pagine (usata dal purge): un superset di pagine e' sempre sicuro,
// una pagina mancante no. Da confermare/correggere; il file si puo' rigenerare o modificare a mano.
import fs from 'node:fs';
import { analizza } from './census.mjs';

const { perPagina } = analizza();
const pagineCon = (id) => Object.entries(perPagina).filter(([, c]) => c[id] > 0).map(([p]) => p).sort();
const sitemap = [...fs.readFileSync('public/sitemap.xml', 'utf8').matchAll(/<loc>https:\/\/www\.ecura\.it([^<]*)<\/loc>/g)].map(m => m[1]);

const blocchi = {
  'EC-01': { titolo: 'Homepage — hero / claim principale', pagine: ['/'] },
  'EC-02': { titolo: 'Schede dispositivo (classe, BD/RDM, CND)', pagine: pagineCon('EC-02').filter(p => !p.startsWith('/blog/')) },
  'EC-03': { titolo: 'Prezzi + markup strutturale Product/MedicalDevice', pagine: pagineCon('EC-03') },
  'EC-04': { titolo: 'Confronti nominativi (Seremy, Beghelli)', pagine: pagineCon('EC-04') },
  'EC-05': { titolo: 'Testimonial e valutazioni a stelle', pagine: pagineCon('EC-05') },
  'EC-06': { titolo: 'Meta, title, alt, OG', pagine: sitemap.filter(p => !p.startsWith('/blog/') || pagineCon('EC-06').includes(p)) },
  'EC-12': { titolo: 'Pagine confronto e guida dispositivi (rilevate live 22/11)', pagine: ['/confronto-bracciali-anziani/', '/guida-dispositivi-medici-teleassistenza/'] },
};
for (const b of Object.values(blocchi)) b.pagine = [...new Set(b.pagine)].sort();
fs.writeFileSync('functions/_lib/claim-blocchi.json', JSON.stringify({ _nota: 'PROPOSTA generata da scripts/claim-dm/genera-blocchi.mjs - da confermare', blocchi }, null, 2) + '\n');
for (const [id, b] of Object.entries(blocchi)) console.log(id, b.pagine.length, b.pagine.slice(0, 4).join(' '), b.pagine.length > 4 ? '...' : '');
