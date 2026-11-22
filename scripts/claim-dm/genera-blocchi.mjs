// Genera functions/_lib/claim-blocchi.json (titolo + pagine per blocco) dal censimento dello snapshot live.
// Mappatura (corretta dal committente il 22/11): le pagine /blog/* NON sono nel file (sono articoli D1, si correggono in admin
// come articoli). EC-04 = solo /confronto-bracciali-anziani/, EC-12 = solo /guida-dispositivi-medici-teleassistenza/.
// EC-03 comprende ogni pagina con JSON-LD Product/MedicalDevice/Offer (omesso quando EC-03 non emette ORIGINALE).
// Le pagine servono al purge: un superset e' sempre sicuro, una pagina mancante no.
import fs from 'node:fs';
import { analizza } from './census.mjs';

const { perPagina } = analizza();
const nonBlog = p => !p.startsWith('/blog/');
const pagineCon = (id) => Object.entries(perPagina).filter(([, c]) => c[id] > 0).map(([p]) => p).filter(nonBlog).sort();
const percorsoFile = p => 'public' + (p.endsWith('/') ? p + 'index.html' : p);
const sitemap = [...fs.readFileSync('public/sitemap.xml', 'utf8').matchAll(/<loc>https:\/\/www\.ecura\.it([^<]*)<\/loc>/g)].map(m => m[1]);

const conJsonLdProdotto = sitemap.filter(nonBlog).filter(p => fs.existsSync(percorsoFile(p)) &&
  [...fs.readFileSync(percorsoFile(p), 'utf8').matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].some(m => /"@type":\s*"(?:Product|MedicalDevice|Offer)"/.test(m[1])));

const blocchi = {
  'EC-01': { titolo: 'Homepage — hero / claim principale', pagine: ['/'] },
  'EC-02': { titolo: 'Schede dispositivo (classe, BD/RDM, CND)', pagine: pagineCon('EC-02') },
  'EC-03': { titolo: 'Prezzi + markup strutturale Product/MedicalDevice', pagine: [...pagineCon('EC-03'), ...conJsonLdProdotto] },
  'EC-04': { titolo: 'Confronti nominativi (Seremy, Beghelli)', pagine: ['/confronto-bracciali-anziani/'] },
  'EC-05': { titolo: 'Testimonial e valutazioni a stelle', pagine: pagineCon('EC-05') },
  'EC-06': { titolo: 'Meta, title, alt, OG', pagine: sitemap.filter(nonBlog) },
  'EC-12': { titolo: 'Guida dispositivi medici (rilevata live 22/11)', pagine: ['/guida-dispositivi-medici-teleassistenza/'] },
};
for (const b of Object.values(blocchi)) b.pagine = [...new Set(b.pagine)].sort();
fs.writeFileSync('functions/_lib/claim-blocchi.json', JSON.stringify({ _nota: 'Generato da scripts/claim-dm/genera-blocchi.mjs. Mappatura confermata dal committente il 22/11 (niente pagine /blog/*).', blocchi }, null, 2) + '\n');
for (const [id, b] of Object.entries(blocchi)) console.log(id, b.pagine.length, b.pagine.slice(0, 4).join(' '), b.pagine.length > 4 ? '...' : '');
