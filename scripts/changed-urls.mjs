#!/usr/bin/env node
/**
 * changed-urls.mjs — elenca le URL INDICIZZABILI delle pagine HTML modificate tra due commit.
 *
 *   node scripts/changed-urls.mjs <commit-prima> <commit-dopo>
 *
 * Stampa una URL per riga (nessun output = niente da notificare). Una pagina e' «indicizzabile» solo se la
 * sua URL e' nel sitemap.xml: cosi' restano fuori per costruzione /admin, /strategia-seo-link-building,
 * /grazie, 404 e i file di verifica (nessun elenco di esclusioni duplicato qui).
 * Non lancia mai: se git non trova il commit di partenza stampa un avviso su stderr ed esce senza URL.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const ORIGIN = 'https://www.ecura.it/';

/** URL delle pagine nel sitemap (<loc>; <image:loc> non corrisponde al pattern). */
export function sitemapUrls(xml) {
  return new Set([...String(xml).matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]));
}

/** public/index.html → /, public/x/index.html → /x/, public/x.html → /x.html; qualsiasi altro file → null. */
export function urlForFile(file) {
  if (typeof file !== 'string' || !file.startsWith('public/') || !file.endsWith('.html')) return null;
  const rel = file.slice('public/'.length);
  if (rel === 'index.html') return ORIGIN;
  if (rel.endsWith('/index.html')) return ORIGIN + rel.slice(0, -'index.html'.length);
  return ORIGIN + rel;
}

export function urlsFromChangedFiles(files, indexable) {
  const out = [];
  for (const f of files) {
    const u = urlForFile(String(f).trim());
    if (u && indexable.has(u) && !out.includes(u)) out.push(u);
  }
  return out;
}

function main() {
  const [beforeArg, sha] = process.argv.slice(2);
  if (!sha) { console.error('Uso: node scripts/changed-urls.mjs <commit-prima> <commit-dopo>'); return; }
  const before = !beforeArg || /^0+$/.test(beforeArg) ? `${sha}~1` : beforeArg;
  let files;
  try {
    files = execFileSync('git', ['diff', '--name-only', '--diff-filter=AMR', before, sha, '--', 'public'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) {
    console.error(`[changed-urls] diff non calcolabile (${before}..${sha}): nessun ping.`);
    return;
  }
  const indexable = sitemapUrls(readFileSync('public/sitemap.xml', 'utf8'));
  for (const u of urlsFromChangedFiles(files, indexable)) console.log(u);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
