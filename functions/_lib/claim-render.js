// Render lato server dei blocchi claim (prompt §6): template statico + marcatori, testi e stato SOLO da D1, nulla lato client.
// Il template contiene solo il markup; i testi dei blocchi non sono scritti nel codice.
import { risolviTutti, leggiConfig, renderConStale } from './claim-blocks.js';
import { PAGINE } from './claim-pagine.js';

const RE_BLOCCO = /<!--claim:(EC-\d{2})-->([\s\S]*?)<!--\/claim:\1-->/g;
const RE_LD = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const haHtml = t => /<\/?[a-z][^>]*>|<!--/i.test(t);

/**
 * Testo di un blocco -> HTML. Un testo che contiene tag e' HTML scritto da un amministratore autenticato (come gli articoli del blog):
 * si inserisce com'e'. Un testo semplice (paragrafi separati da riga vuota) viene escapato e messo in <p>.
 * EC-01 (hero): il primo paragrafo e' l'H1, gli altri il sottotitolo; l'H1 resta H1 in ogni stato (struttura SEO indipendente dallo stato).
 */
export function testoInHtml(blockId, testo) {
  const grezzo = String(testo || '');
  const t = grezzo.trim();
  if (!t) return '';
  if (haHtml(t)) return grezzo; // HTML: invariato byte per byte (l'ORIGINALE deve ricostruire la pagina identica al template)
  const par = t.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (blockId === 'EC-01') return `<h1>${esc(par[0])}</h1>` + par.slice(1).map(p => `<p class="lead">${esc(p)}</p>`).join('');
  return par.map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('\n');
}

const RE_EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}/i;
/**
 * HTML emesso per un blocco risolto ('' = nessun output).
 * Lo snapshot live NON contiene i commenti email_off (Cloudflare li rimuove in uscita): un testo ORIGINALE che contiene indirizzi e-mail
 * va quindi riavvolto in email_off, altrimenti l'edge offusca l'indirizzo (a differenza di oggi). Se il testo li ha gia' (scritto in admin) non si annida.
 */
export function htmlBlocco(r) {
  if (!r || !r.testo) return '';
  let h = testoInHtml(r.block_id, r.testo);
  if (r.riferimento) h += `\n<p class="claim-riferimento">${esc(r.riferimento)}</p>`;
  if (RE_EMAIL.test(h) && !/<!--\s*email_off\s*-->/i.test(h)) h = `<!--email_off-->${h}<!--/email_off-->`;
  return h;
}

/** Sostituisce le regioni marcate. LANCIA (fail-closed) se manca un marcatore atteso, se un blocco non e' in D1 o se restano marcatori. */
export function applicaBlocchi(html, path, risolti) {
  const visti = new Set();
  const out = html.replace(RE_BLOCCO, (m, id, interno) => {
    visti.add(id);
    const r = risolti[id];
    if (!r) throw new Error(`blocco ${id} assente da D1`);
    return r.statico ? interno : htmlBlocco(r); // ORIGINALE senza testo: resta il contenuto statico del template
  });
  for (const id of (PAGINE[path] || {}).blocchi || []) if (!visti.has(id)) throw new Error(`marcatore ${id} mancante in ${path}`);
  if (/<!--\/?claim:/.test(out)) throw new Error('marcatori claim residui');
  return out;
}

// ---- JSON-LD: omette MedicalDevice / Product / offers quando EC-03 non emette ORIGINALE (§6) ----
const TIPI_RIMOSSI = new Set(['MedicalDevice', 'Product', 'Offer', 'AggregateOffer', 'OfferCatalog']);
const CHIAVI_RIMOSSE = new Set(['offers', 'hasOfferCatalog']);
const tipiDi = n => [].concat(n && n['@type'] || []);
const daRimuovere = n => n && typeof n === 'object' && !Array.isArray(n) && tipiDi(n).some(t => TIPI_RIMOSSI.has(t));

/** Raccoglie gli @id dei nodi che verranno rimossi (anche in altri script JSON-LD della stessa pagina: i riferimenti li attraversano). */
export function raccogliIdRimossi(json, set = new Set()) {
  (function raccogli(v) {
    if (Array.isArray(v)) return v.forEach(raccogli);
    if (!v || typeof v !== 'object') return;
    if (daRimuovere(v) && v['@id']) set.add(v['@id']);
    Object.values(v).forEach(raccogli);
  })(json);
  return set;
}

export function potaMarkupProdotto(json, idEsterni = new Set()) {
  const idRimossi = raccogliIdRimossi(json, new Set(idEsterni));
  const pulisci = v => {
    if (Array.isArray(v)) return v.map(pulisci).filter(x => x !== undefined);
    if (!v || typeof v !== 'object') return v;
    if (daRimuovere(v)) return undefined;
    const chiavi = Object.keys(v);
    if (chiavi.length === 1 && chiavi[0] === '@id' && idRimossi.has(v['@id'])) return undefined; // riferimento pendente a un nodo rimosso
    for (const k of chiavi) {
      if (CHIAVI_RIMOSSE.has(k)) { delete v[k]; continue; }
      const era = Array.isArray(v[k]); const r = pulisci(v[k]);
      if (r === undefined || (era && r.length === 0)) delete v[k]; else v[k] = r;
    }
    return v;
  };
  return pulisci(json);
}

export function potaJsonLd(html) {
  // 1) id dei nodi prodotto in TUTTI gli script della pagina; 2) potatura di ciascuno con l'insieme completo
  const idPagina = new Set();
  for (const m of html.matchAll(RE_LD)) { try { raccogliIdRimossi(JSON.parse(m[1]), idPagina); } catch { /* gestito sotto */ } }
  return html.replace(RE_LD, (m, corpo) => {
    let json;
    try { json = JSON.parse(corpo); } catch {
      // non analizzabile: se contiene markup prodotto non si puo' potare in sicurezza => si elimina l'intero blocco
      return /"@type"\s*:\s*"(?:Product|MedicalDevice|Offer)"|"offers"/.test(corpo) ? '' : m;
    }
    const p = potaMarkupProdotto(json, idPagina);
    const nodi = p && p['@graph'] ? p['@graph'] : null;
    if (p === undefined || (nodi && nodi.length === 0)) return '';
    return `<script type="application/ld+json">${JSON.stringify(p).replace(/</g, '\\u003c')}</script>`;
  });
}

// ---- pagina completa ----
export const renderAttivo = env => ['1', 'true', 'on'].includes(String((env && env.CLAIM_RENDER_ATTIVO) ?? '').toLowerCase());
const HDR_DA_NON_COPIARE = ['content-length', 'content-encoding', 'etag', 'last-modified', 'transfer-encoding'];

/** Renderizza una pagina: asset statico + blocchi da D1. LANCIA se D1/asset non sono disponibili (il chiamante fa stale-if-error). */
export async function renderPagina({ path, request, env, now = new Date() }) {
  if (!PAGINE[path]) throw new Error('pagina non gestita ' + path);
  if (!env || !env.DB) throw new Error('D1 non disponibile');
  const asset = await env.ASSETS.fetch(new Request(new URL(path, request.url).toString(), { method: 'GET' }));
  if (!asset.ok) throw new Error('asset non disponibile ' + asset.status);
  let html = await asset.text();
  const risolti = await risolviTutti(env.DB, now);
  html = applicaBlocchi(html, path, risolti);
  if (PAGINE[path].jsonld) {
    const ec03 = risolti['EC-03'];
    if (!ec03) throw new Error('blocco EC-03 assente da D1');
    // Solo ORIGINALE (anche "statico") emette il markup prodotto: TRANSITORIA/AUTORIZZATA lo omettono (§6, lettera).
    if (ec03.stato_effettivo !== 'ORIGINALE') html = potaJsonLd(html);
  }
  const h = new Headers(asset.headers);
  for (const k of HDR_DA_NON_COPIARE) h.delete(k);
  h.set('Content-Type', 'text/html; charset=utf-8');
  return new Response(html, { status: 200, headers: h });
}

/** Toglie i marcatori lasciando il contenuto statico del template (render spento o blocco inerte). */
export const senzaMarcatori = html => html.replace(RE_BLOCCO, (m, id, interno) => interno);

/**
 * Punto d'ingresso delle Pages Function.
 *  - metodi diversi da GET/HEAD, o URL senza "/" finale (redirect canonico dell'asset): si passa all'asset, invariato;
 *  - render spento (default): asset statico SENZA marcatori, nessuna dipendenza da D1;
 *  - render acceso: blocchi da D1 con stale-if-error (cache -> ultima pagina buona; altrimenti pagina di errore gestita).
 */
export async function servePagina(context, path, { cache, now } = {}) {
  const { request, env } = context;
  const url = new URL(request.url);
  if (!['GET', 'HEAD'].includes(request.method) || url.pathname !== path) return env.ASSETS.fetch(request);
  if (!renderAttivo(env)) {
    const asset = await env.ASSETS.fetch(request);
    const tipo = asset.headers.get('Content-Type') || '';
    if (!asset.ok || !tipo.includes('text/html') || request.method === 'HEAD') return asset;
    const h = new Headers(asset.headers); for (const k of HDR_DA_NON_COPIARE) h.delete(k);
    return new Response(senzaMarcatori(await asset.text()), { status: asset.status, headers: h });
  }
  const chiave = new Request(new URL(path, request.url).toString(), { method: 'GET' });
  const c = cache !== undefined ? cache : (typeof caches !== 'undefined' ? caches.default : null);
  const cfg = env.DB ? await leggiConfig(env.DB).catch(() => ({})) : {};
  const { response, origine } = await renderConStale(chiave, {
    render: () => renderPagina({ path, request, env, now }), cache: c, now, staleMaxOre: cfg.staleMaxOre,
    waitUntil: context.waitUntil ? p => context.waitUntil(p) : undefined,
  });
  if (origine !== 'fresh') console.error('[claim-dm][ALERT] pagina non renderizzata da D1:', origine, path);
  return request.method === 'HEAD' ? new Response(null, response) : response;
}
