/**
 * Pages Function: /blog/[slug]  e  /blog/[slug]/
 * Serve ogni articolo direttamente da D1 — così le modifiche
 * dal pannello admin si riflettono immediatamente sul sito pubblico.
 */

// Articoli rimossi/spostati: vecchio slug -> percorso di destinazione (301 permanente,
// conserva posizionamento e backlink). Controllato prima della query a D1.
const SLUG_REDIRECTS = {
  // pagina recensioni: non e' piu' un articolo del blog, vive in /recensioni-ecura-seremy-beghelli/
  'sidly-care-recensioni-clienti-ecura': '/recensioni-ecura-seremy-beghelli/',
  'recensioni-ecura-opinioni-clienti-2026': '/recensioni-ecura-seremy-beghelli/',
};

export async function onRequest({ request, env, params }) {
  const db = env.DB;

  const slug = (params.slug || '').replace(/\/+$/, '');
  if (!slug) return passThrough(request, env);

  if (SLUG_REDIRECTS[slug]) {
    const url = new URL(request.url);
    return Response.redirect(`${url.origin}${SLUG_REDIRECTS[slug]}`, 301);
  }

  // File statici nella cartella /blog/ → pass-through diretto al file
  // (feed.xml e altri file non-HTML non sono slug di articoli D1)
  if (slug.includes('.')) return passThrough(request, env);

  if (!db) return passThrough(request, env); // fallback sicuro se DB non è bound

  let article;
  try {
    article = await db.prepare(
      'SELECT * FROM blog_articles WHERE slug = ? AND status = ?'
    ).bind(slug, 'published').first();
  } catch (e) {
    return passThrough(request, env);
  }

  if (!article) {
    return new Response(notFoundHtml(slug), {
      status: 404,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  }

  const html = renderArticle(article);
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  });
}

/** Se qualcosa va storto o è un file statico, lascia passare al file statico.
 *  Usa env.ASSETS se disponibile (Cloudflare Pages), altrimenti fetch diretto. */
function passThrough(request, env) {
  if (env && env.ASSETS) return env.ASSETS.fetch(request);
  return fetch(request);
}

/** Decodifica entità HTML come &#39; → ' per mostrare il testo correttamente */
function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('it-IT', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch { return d; }
}

// ── SEO title/desc overrides (Ahrefs audit 2026-10-15) ──────────────────────
// Il template aggiunge " | eCura" (8c) → titoli DB devono essere ≤52c per stare a ≤60c totali.
// Questi slug hanno titolo/desc troppo lunga nel D1; override diretto nel template
// finché non si ha accesso wrangler per eseguire la migration 0006_fix_titles_desc.sql.
const TITLE_OVERRIDES = {
  'dispositivo-medico-classe-iia-anziani':   'Dispositivo Medico Classe IIA: guida completa',
  'centrale-operativa-h24-teleassistenza':   'Centrale Operativa H24: come funziona davvero',
  'anziano-solo-casa-soluzioni-sicurezza':   'Anziano Solo in Casa: soluzioni di sicurezza 2026',
  'caregiver-distanza-genitori-anziani-estero': 'Caregiver a Distanza: assistere i genitori anziani',
};
const DESC_OVERRIDES = {
  'caregiver-distanza-genitori-anziani-estero':
    "Vivi all'estero e i tuoi genitori sono soli in Italia? Scopri eCura: GPS, cadute, app familiare, centrale H24 e SIM multi-provider UE inclusa.",
};

function renderArticle(a) {
  const title   = TITLE_OVERRIDES[a.slug] || decodeEntities(a.title || '');
  const desc    = DESC_OVERRIDES[a.slug]  || decodeEntities(a.description || '');
  // Rimuove solo le <figure> e <img> hero standalone (article-hero-img),
  // NON quelle dentro .product-card-img o altri contenitori di contenuto.
  let rawContent = decodeEntities(a.content || '');
  // Rimuove solo le <figure> con class "article-hero" o standalone fuori da product-card
  rawContent = rawContent.replace(/<figure[^>]*class="[^"]*article-hero[^"]*"[^>]*>[\s\S]*?<\/figure>/gi, '');
  // Rimuove <img> con class article-hero-img (già mostrata nell'header)
  rawContent = rawContent.replace(/<img[^>]*class="[^"]*article-hero-img[^"]*"[^>]*>/gi, '');
  const content = rawContent;
  const hero    = a.hero_image || '/img/blog/default.jpg';
  const heroAlt = decodeEntities(a.hero_image_alt || title);
  const cat     = decodeEntities(a.category || '');
  const color   = a.tag_color || '#068D86';
  const author  = decodeEntities(a.author || 'Redazione eCura');
  const isEditorial = /^redazione/i.test(author) || /^team ecura/i.test(author);
  const date    = fmtDate(a.date_published);
  const modDate = fmtDate(a.date_modified || a.updated_at);
  const read    = decodeEntities(a.read_time || '');
  const slug    = a.slug || '';
  const canonical = `https://www.ecura.it/blog/${slug}/`;

  // ── Schema.org extras: FAQPage + HowTo + SpeakableSpec + AggregateRating ──
  // Estratti direttamente dall'HTML del content, senza colonne D1 aggiuntive.

  let faqNode = null;
  try {
    // Pattern 1: blocchi .faq-item con <strong>domanda</strong> + <p>risposta</p>
    const faqMatches = [...content.matchAll(/<div[^>]*class="faq-item"[^>]*>[\s\S]*?<strong>([\s\S]*?)<\/strong>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];

    // Pattern 2: sezione "Domande frequenti" con <h3> + <p> (formato articolo confronto)
    let faqH3Matches = [];
    const faqSectionMatch = content.match(/<h2[^>]*>[^<]*[Dd]omande[^<]*<\/h2>([\s\S]*?)(?:<h2|<div class="article-cta"|$)/i);
    if (faqSectionMatch) {
      faqH3Matches = [...faqSectionMatch[1].matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)];
    }

    // Pattern 3: <details><summary>domanda</summary><div><p>risposta</p></div></details>
    // (formato dei nuovi articoli: accordion nativo, accessibile senza JS)
    const faqDetailsMatches = [...content.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi)];

    const allFaqs = [
      ...faqMatches.map(m => ({ q: m[1], a: m[2] })),
      ...faqH3Matches.map(m => ({ q: m[1], a: m[2] })),
      ...faqDetailsMatches.map(m => ({ q: m[1], a: m[2] }))
    ];

    if (allFaqs.length > 0) {
      const qas = allFaqs.map(f => ({
        '@type': 'Question',
        'name': decodeEntities(f.q.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()),
        'acceptedAnswer': { '@type': 'Answer', 'text': decodeEntities(f.a.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()) }
      }));
      faqNode = { '@type': 'FAQPage', '@id': `${canonical}#faq`, 'inLanguage': 'it-IT', 'isPartOf': { '@id': canonical }, 'mainEntity': qas };
    }
  } catch(e) { /* skip */ }

  let howtoNode = null;
  try {
    // HowTo: solo per articoli con pattern "N. Titolo: testo" in <li><strong>
    const howtoMatches = [...content.matchAll(/<li[^>]*>[\s\S]*?<strong>(\d+\.\s[^<]+)<\/strong>:?\s*([\s\S]*?)<\/li>/gi)];
    if (howtoMatches.length >= 5) { // almeno 5 step per qualificarsi come HowTo
      const steps = howtoMatches.map((m, i) => ({
        '@type': 'HowToStep',
        'position': i + 1,
        'name': m[1].replace(/^\d+\.\s*/,'').trim(),
        'text': m[2].replace(/<[^>]+>/g,'').trim()
      }));
      howtoNode = {
        '@type': 'HowTo',
        '@id': `${canonical}#howto`,
        'name': title,
        'description': desc,
        'step': steps
      };
    }
  } catch(e) { /* skip */ }

  // Nota E-E-A-T/policy Google: il Product con aggregateRating NON viene più emesso sulle pagine
  // articolo (le recensioni non sono visibili in pagina). Il prodotto è collegato via @id alla home.

  // Fonti istituzionali: solo link presenti in un blocco visibile class="fonti" del contenuto
  let citations = [];
  try {
    const fm = rawContent.match(/<(div|p|ul)[^>]*class="fonti"[^>]*>([\s\S]*?)<\/\1>/i);
    if (fm) {
      citations = [...fm[2].matchAll(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
        .map(m => ({ '@type': 'CreativeWork', 'name': decodeEntities(m[2].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()), 'url': m[1] }));
    }
  } catch(e) { /* skip */ }

  // Parole chiave/entità trattate dall'articolo (solo se effettivamente presenti nel testo)
  const plain = decodeEntities(rawContent.replace(/<[^>]+>/g,' ')).toLowerCase();
  const topicMap = [
    ['teleassistenza anziani', 'Teleassistenza per anziani'],
    ['bracciale', 'Bracciale cadute anziani'],
    ['rilevamento cadute', 'Rilevamento automatico cadute'],
    ['classe iia', 'Dispositivo medico Classe IIA'],
    ['centrale operativa', 'Centrale operativa H24'],
    ['gps', 'Localizzazione GPS indoor/outdoor'],
    ['detraibil', 'Detrazione IRPEF 19% dispositivi medici'],
    ['badante', 'Assistenza domiciliare anziani']
  ];
  const mentions = topicMap.filter(([k]) => plain.includes(k)).map(([, n]) => ({ '@type': 'Thing', 'name': n }));

  // ── VideoObject — estratto da iframe YouTube nel content ────────────────────
  let videoSchemaBlock = '';
  try {
    const ytMatch = content.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      const ytId = ytMatch[1];
      videoSchemaBlock = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        'name': title,
        'description': desc,
        'thumbnailUrl': `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
        'embedUrl': `https://www.youtube.com/embed/${ytId}`,
        'uploadDate': a.date_published || new Date().toISOString(),
        'publisher': {
          '@type': 'Organization',
          'name': 'eCura by Medica GB',
          'logo': { '@type': 'ImageObject', 'url': 'https://www.ecura.it/img/logo.png' }
        }
      });
    }
  } catch(e) { /* skip */ }

  // Related articles
  const relatedCards = [
    { slug: a.related_1_slug, title: a.related_1_title, excerpt: a.related_1_excerpt, tag: a.related_1_tag },
    { slug: a.related_2_slug, title: a.related_2_title, excerpt: a.related_2_excerpt, tag: a.related_2_tag },
    { slug: a.related_3_slug, title: a.related_3_title, excerpt: a.related_3_excerpt, tag: a.related_3_tag },
  ].filter(r => r.slug && r.title).map(r => `
    <div class="related-card">
      <span class="tag">${esc(decodeEntities(r.tag || cat))}</span>
      <h3><a href="/blog/${esc(r.slug)}/">${esc(decodeEntities(r.title))}</a></h3>
      ${r.excerpt ? `<p>${esc(decodeEntities(r.excerpt))}</p>` : ''}
      <a href="/blog/${esc(r.slug)}/">Leggi l'articolo &rarr;</a>
    </div>`).join('');

  const relatedSection = relatedCards ? `
    <section class="related-section">
      <div class="container">
        <h2>Potrebbe interessarti anche</h2>
        <div class="related-grid">${relatedCards}</div>
      </div>
    </section>` : '';

  // ── FIX 7: CTA mid-article — inserita dopo il 40% dei paragrafi ──────────
  // Divide il contenuto HTML in paragrafi/blocchi e inserisce il box CTA
  // a circa metà, prima di mostrare il resto dell'articolo.
  const MID_CTA_HTML = `
<div style="background:linear-gradient(135deg,#f0faf9 0%,#e8f6f5 100%);
     border:1px solid #b2e0dd;border-radius:14px;padding:22px 24px;
     margin:32px 0;display:flex;align-items:flex-start;gap:16px">
  <div style="font-size:2rem;flex-shrink:0;line-height:1">🛡️</div>
  <div style="flex:1;min-width:0">
    <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;
         letter-spacing:.06em;color:#068D86;margin-bottom:4px">Bracciale eCura</div>
    <div style="font-weight:700;font-size:1rem;color:#080E49;margin-bottom:6px;line-height:1.3">
      Proteggi i tuoi cari con il dispositivo medico certificato Classe IIA
    </div>
    <div style="font-size:.85rem;color:#444;line-height:1.5;margin-bottom:14px">
      GPS indoor/outdoor &middot; SOS automatico &middot; Centrale H24 &middot; Da &euro;390/anno &middot; Detraibile al 19%
    </div>
    <a href="https://www.ecura.it/#contattaci"
       style="display:inline-block;background:#068D86;color:#fff;text-decoration:none;
              border-radius:30px;padding:10px 22px;font-size:.9rem;font-weight:700;
              box-shadow:0 3px 10px rgba(6,141,134,.25);transition:background .2s"
       onmouseover="this.style.background='#05B1A8'" onmouseout="this.style.background='#068D86'">
      Richiedi informazioni gratuite &rarr;
    </a>
  </div>
</div>`;

  // Splitta su tag di chiusura blocco e inserisce la CTA dopo ca. il 40% dei segmenti
  let bodyWithCta = content;
  try {
    const parts = content.split(/(?<=<\/(?:p|li|h[2-6]|blockquote|div)>)/i);
    if (parts.length >= 4) {
      const midIdx = Math.max(2, Math.floor(parts.length * 0.40));
      parts.splice(midIdx, 0, MID_CTA_HTML);
      bodyWithCta = parts.join('');
    }
  } catch(e) { /* fallback: contenuto invariato */ }

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | eCura</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<link rel="canonical" href="${canonical}">
<meta name="geo.position" content="45.4654219;9.1859243">
<meta name="geo.region" content="IT-MI">
<meta name="geo.placename" content="Milano, Lombardia, Italia">
<meta name="ICBM" content="45.4654219, 9.1859243">
<link rel="ai-catalog" href="https://www.ecura.it/ai-catalog.json" type="application/json">
<meta property="og:type" content="article">
<meta property="og:locale" content="it_IT">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="eCura - Teleassistenza Anziani">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(hero)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="article:publisher" content="https://www.facebook.com/ecura.it">
<meta property="article:author" content="https://www.ecura.it/">
${a.date_published ? `<meta property="article:published_time" content="${a.date_published}">` : ''}
${(a.date_modified || a.updated_at) ? `<meta property="article:modified_time" content="${a.date_modified || a.updated_at}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@ecura_it">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(hero)}">
<!-- ═══ Schema.org BlogPosting — snippet ricchi Google/Bing ══════════
     Aggiunge: headline, image, datePublished, dateModified, author,
     publisher con logo, wordCount stimato, articleSection.
     Potenzia l'eligibilità per Top Stories, rich snippets e AI Overviews.
════════════════════════════════════════════════════════════════════ -->
<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": `${canonical}#article`,
      "headline": title.substring(0, 110),
      "description": desc,
      "url": canonical,
      "datePublished": a.date_published || a.created_at || new Date().toISOString(),
      "dateModified": a.date_modified || a.updated_at || a.date_published || new Date().toISOString(),
      "author": isEditorial
        ? { "@type": "Organization", "@id": "https://www.ecura.it/#organization", "name": "Redazione eCura (Medica GB S.r.l.)", "url": "https://www.ecura.it/" }
        : { "@type": "Person", "name": author, "url": "https://www.ecura.it/", "worksFor": { "@id": "https://www.ecura.it/#organization" } },
      "about": [
        { "@id": "https://www.ecura.it/#service" },
        { "@type": "Thing", "name": "teleassistenza anziani" },
        { "@type": "Thing", "name": "bracciale cadute anziani" }
      ],
      "mentions": mentions,
      "citation": citations.length ? citations : undefined,
      "keywords": "teleassistenza anziani, bracciale cadute anziani, rilevamento cadute, dispositivo medico Classe IIA",
      "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".article-body > p:first-of-type", ".callout"] },
      "hasPart": faqNode ? { "@id": faqNode['@id'] } : undefined,
      "publisher": {
        "@type": "Organization",
        "@id": "https://www.ecura.it/#organization",
        "name": "Medica GB Srl — eCura",
        "url": "https://www.ecura.it/",
        "sameAs": [
          "https://it.linkedin.com/company/medica-gb-s-r-l",
          "https://www.medicagb.it/",
          "https://www.facebook.com/profile.php?id=61585121784918",
          "https://www.instagram.com/ecura_it/"
        ],
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.ecura.it/img/logo-ecura-trasp.png",
          "width": 240,
          "height": 80
        }
      },
      "image": {
        "@type": "ImageObject",
        "url": hero.startsWith('http') ? hero : `https://www.ecura.it${hero}`,
        "width": 1200,
        "height": 630
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonical
      },
      "articleSection": cat || "Teleassistenza Anziani",
      "inLanguage": "it",
      "wordCount": Math.round(rawContent.replace(/<[^>]+>/g,'').split(/\s+/).filter(Boolean).length),
      "isPartOf": {
        "@type": "Blog",
        "name": "Blog eCura — Teleassistenza Anziani",
        "url": "https://www.ecura.it/blog/"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ecura.it/"},
        {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.ecura.it/blog/"},
        {"@type": "ListItem", "position": 3, "name": title, "item": canonical}
      ]
    },
    ...(faqNode ? [faqNode] : []),
    ...(howtoNode ? [howtoNode] : [])
  ]
}).replace(/</g,'\\u003c')}
</script>
<link rel="preload" href="/fonts/roboto-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/fonts.css?v=1">
<link rel="stylesheet" href="/vendor/bootstrap-5.3.3/bootstrap.min.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="/vendor/bootstrap-5.3.3/bootstrap.min.css"></noscript>
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/blog.css?v=2">
<style>.ecura-email::before{content:attr(data-e)}</style>
<style>
/* Comparison Table */
.comp-table{width:100%;border-collapse:collapse;margin:28px 0;font-size:.92rem}
.comp-table th{background:#080E49;color:#fff;padding:14px 16px;text-align:left;font-size:.95rem}
.comp-table th.best{background:#068D86!important;color:#fff!important;font-size:1.05rem;font-weight:700;border-top:3px solid #04b8ae}
.comp-table td{padding:11px 14px;border-bottom:1px solid #f0f0f0;color:#3D3C3B}
.comp-table tr:nth-child(even) td{background:#f7f4ef}
.comp-table .yes{color:#068D86;font-weight:600}
.comp-table .no{color:#cc0000}
.comp-table .low{color:#999;font-style:italic;font-size:.85rem}
.comp-table td.best{background:rgba(6,141,134,.07)!important}
.comp-table tr:nth-child(even) td.best{background:rgba(6,141,134,.12)!important}
/* Product Comparison Cards */
.img-caption{font-size:.78rem;color:#888;text-align:center;margin-top:6px;font-style:italic}
.badge-cert{display:inline-block;padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:600;margin-top:4px}
.cert-yes{background:#e6f9f7;color:#068D86;border:1px solid #068D86}
.cert-no{background:#fef0f0;color:#cc2200;border:1px solid #cc2200}
.product-card{border:1px solid #e3dfdd;border-radius:12px;overflow:hidden;margin:20px 0 32px;box-shadow:0 2px 10px rgba(0,0,0,.06)}
.product-card-header{background:#f7f4ef;padding:16px 20px;border-bottom:1px solid #e3dfdd;display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.product-card-body{display:grid;grid-template-columns:200px 1fr;gap:0}
.product-card-img{padding:20px 16px;border-right:1px solid #e3dfdd;display:flex;align-items:flex-start;justify-content:center}
.product-card-img img{width:100%;max-width:180px;height:auto;border-radius:8px;object-fit:contain}
.product-card-specs{padding:16px 20px}
.spec-row{display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid #f0f0f0;gap:12px;font-size:.88rem}
.spec-row:last-of-type{border-bottom:none}
.spec-label{color:#555;flex:0 0 auto;max-width:55%}
.spec-val{color:#080E49;font-weight:500;text-align:right}
.spec-val.ok{color:#068D86}
.spec-val.no{color:#cc2200}
.spec-val.mid{color:#b36200}
.verdict-box{margin-top:14px;border-radius:8px;padding:14px 16px;font-size:.87rem;line-height:1.6}
.verdict-box.good{background:#e6f9f7;border-left:4px solid #068D86}
.verdict-box.mid{background:#fff8e6;border-left:4px solid #b36200}
.verdict-box.basic{background:#f5f5f5;border-left:4px solid #999}
.verdict-box strong{display:block;margin-bottom:4px}
.winner-banner{background:linear-gradient(135deg,#068D86,#080E49);color:#fff;border-radius:10px;padding:20px 24px;margin:32px 0;display:flex;align-items:center;gap:16px}
.winner-banner .trophy{font-size:2rem}
.winner-banner h3{color:#fff;margin:0 0 4px;font-size:1.1rem}
.winner-banner p{color:rgba(255,255,255,.85);margin:0;font-size:.88rem}
.product-imgs-row{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:24px 0}
.product-imgs-row figure{flex:1 1 140px;max-width:200px;text-align:center;margin:0}
.product-imgs-row img{width:100%;border-radius:8px;object-fit:contain}
@media(max-width:640px){
  .product-card-body{grid-template-columns:1fr}
  .product-card-img{border-right:none;border-bottom:1px solid #e3dfdd;padding:16px}
  .product-card-img img{max-width:140px}
  .spec-label{max-width:60%}
}
</style>
<link rel="icon" type="image/png" href="/img/favicon/favicon-96x96.png" sizes="96x96">
<link rel="apple-touch-icon" href="/img/favicon/apple-touch-icon.png">
<link rel="manifest" href="/img/favicon/site.webmanifest">
${videoSchemaBlock ? `<script type="application/ld+json">${videoSchemaBlock}</script>` : ''}
<script src="/js/ecura-consent.js?v=1" defer></script>
</head>
<body>
<a class="skip-link" href="#main-content">Salta al contenuto</a>
<div class="container-fluid" id="full_top_nav">
  <div class="container">
    <div class="full_top_nav_wrapper d-flex justify-content-between align-items-center">
      <a href="/" aria-label="eCura — home">
        <img src="/img/logo-ecura-trasp.png" alt="eCura logo" width="110" height="36" loading="eager">
      </a>
      <nav class="top_nav_wrapper" aria-label="Navigazione principale">
        <div class="top_nav">
          <ul class="top_Menu">
            <li><a href="/#heroSection">Cos'è eCura</a></li>
            <li><a href="/#whyEcura">Perché eCura</a></li>
            <li><a href="/#pricingPlan">Prezzi</a></li>
            <li><a href="/blog/" class="active">Blog</a></li>
            <li><a href="/#faqAccordion">FAQ</a></li>
          </ul>
        </div>
      </nav>
      <a href="/#pricingPlan" class="cta-standard-green d-none d-md-inline-block">Scopri i Piani</a>
      <div id="hamburgerWrap" role="button" aria-label="Apri menu" aria-expanded="false" tabindex="0">
        <div id="hamburger"><span class="line"></span><span class="line"></span><span class="line"></span></div>
      </div>
    </div>
  </div>
</div>
<main id="main-content">
<div class="breadcrumb-wrap"><div class="container"><ol>
  <li><a href="/">Home</a></li><li><a href="/blog/">Blog</a></li>
  <li>${esc(title)}</li>
</ol></div></div>
<article class="article-wrap">
  <span class="tag" style="background:${esc(color)};color:#fff;padding:3px 12px;border-radius:20px;font-size:.8rem">${esc(cat)}</span>
  <h1 style="font-size:clamp(1.6rem,4vw,2.4rem);margin:16px 0 10px;color:#080E49">${esc(title)}</h1>
  <div class="article-meta">
    ${date ? `<span>&#128197; ${date}</span>` : ''}
    ${read ? `<span>&#9201; ${esc(read)}</span>` : ''}
    ${author ? `<span>&#9999; ${esc(author)}</span>` : ''}
  </div>
  <img src="${esc(hero)}" alt="${esc(heroAlt)}" class="article-hero-img" loading="eager" decoding="async" fetchpriority="high"
    style="width:100%;height:auto;border-radius:10px;margin:20px 0 28px;display:block;object-fit:cover;aspect-ratio:16/8"
    onerror="this.src='/img/blog/default.jpg'">
  <div class="article-body">
    ${bodyWithCta}
  </div>
  <div class="article-cta">
    <h3>Proteggi i tuoi cari con eCura</h3>
    <p>Dispositivo medico certificato Classe IIA. GPS indoor+outdoor. Centrale operativa H24. Detraibile al 19%.</p>
    <a href="/#pricingPlan">Scopri i Piani eCura &rarr;</a>
  </div>
  <!-- E-E-A-T: sezione autore -->
  <div class="author-box" style="display:flex;align-items:flex-start;gap:18px;background:#f7f4ef;border-radius:12px;padding:22px 24px;margin:32px 0 8px;border-left:4px solid #068D86">
    <div style="flex-shrink:0;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#068D86,#080E49);display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:#fff">&#129489;</div>
    <div style="flex:1;min-width:0">
      <div style="font-weight:700;color:#080E49;font-size:.95rem;margin-bottom:2px">${esc(author)}</div>
      <div style="font-size:.8rem;color:#068D86;font-weight:600;margin-bottom:8px">Team eCura &mdash; Medica GB Srl</div>
      <p style="font-size:.84rem;color:#555;margin:0;line-height:1.6">Il contenuto di questo articolo è redatto e revisionato dal team eCura, composto da esperti di teleassistenza, dispositivi medici certificati (MDR Classe IIA) e sicurezza domestica per anziani. Medica GB Srl distribuisce il servizio di teleassistenza eCura (dispositivo medico Classe IIA, Centrale Operativa H24, assistenza tecnica e formazione), con esperienza diretta nel settore assistenza anziani. Per approfondimenti scrivici a <a class="ecura-email" data-e="info@ecura.it" href="#" data-email="info" data-domain="ecura.it" onclick="this.href='mailto:'+this.dataset.email+'@'+this.dataset.domain;return true;" style="color:#068D86"></a>.</p>
      <div style="margin-top:10px;font-size:.78rem;color:#888">
        <span>&#x1F4C5; Pubblicato: ${date || '—'}</span>${modDate && modDate !== date ? `&nbsp;&middot;&nbsp;<span>&#x1F504; Aggiornato: ${modDate}</span>` : ''}
        ${read ? `&nbsp;&middot;&nbsp;<span>&#9201; ${esc(read)}</span>` : ''}
        &nbsp;&middot;&nbsp;<span>&#x2714; Verificato dal team eCura</span>
      </div>
    </div>
  </div>
</article>
${relatedSection}
</main>
<footer style="background:#080E49;color:#fff;padding:40px 0 24px;margin-top:64px;">
  <div class="container">
    <div class="row gy-3">
      <div class="col-md-4">
        <img src="/img/logo-ecura-trasp-w.png" alt="eCura logo" width="100" height="33" loading="lazy">
        <p style="font-size:.85rem;color:rgba(255,255,255,.7);margin-top:12px">Bracciale cadute anziani con GPS e teleassistenza H24.<br>Dispositivo medico certificato Classe IIA.</p>
      </div>
      <div class="col-md-4">
        <h4 style="font-size:.95rem;color:#fff;margin-bottom:12px">Pagine utili</h4>
        <ul style="list-style:none;padding:0;font-size:.85rem;">
          <li><a href="/" style="color:rgba(255,255,255,.7)">Home</a></li>
          <li><a href="/blog/" style="color:rgba(255,255,255,.7)">Blog eCura</a></li>
          <li><a href="/confronto-bracciali-anziani/" style="color:rgba(255,255,255,.7)">Confronto bracciali anziani</a></li>
          <li><a href="/bracciale-anziani-detraibile/" style="color:rgba(255,255,255,.7)">Bracciale anziani detraibile</a></li>
          <li><a href="/#faqAccordion" style="color:rgba(255,255,255,.7)">FAQ</a></li>
          <li style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.1)"><span style="font-size:.75rem;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.06em">Guide complete</span></li>
          <li><a href="/guida-cadute-anziani/" style="color:rgba(255,255,255,.7)">Guida cadute anziani</a></li>
          <li><a href="/guida-dispositivi-medici-teleassistenza/" style="color:rgba(255,255,255,.7)">Dispositivi medici &amp; detrazioni</a></li>
          <li><a href="/come-funziona-bracciale-ecura/" style="color:rgba(255,255,255,.7)">Come funziona il bracciale eCura</a></li>
        </ul>
      </div>
      <div class="col-md-4">
        <h4 style="font-size:.95rem;color:#fff;margin-bottom:12px">Contatti</h4>
        <p style="font-size:.85rem;color:rgba(255,255,255,.7)">Medica GB Srl<br>Corso Giuseppe Garibaldi 34<br>20121 Milano<br>
          <a href="tel:+393357301206" style="color:#068D86">+39 335 730 1206</a><br>
          <a class="ecura-email" data-e="info@ecura.it" href="#" data-email="info" data-domain="ecura.it" onclick="this.href='mailto:'+this.dataset.email+'@'+this.dataset.domain;return true;" style="color:#068D86"></a></p>
      </div>
    </div>
    <hr style="border-color:rgba(255,255,255,.15);margin:28px 0 16px">
    <p style="font-size:.78rem;color:rgba(255,255,255,.5);text-align:center;margin:0">
      &copy; 2026 Medica GB Srl &mdash; P.IVA 12435130963 &mdash; Tutti i diritti riservati.<br>
      eCura &egrave; un dispositivo medico Classe IIA ai sensi del Regolamento UE MDR 2017/745.<br>
      <a href="/privacy-policy/" style="color:inherit;text-decoration:underline">Privacy Policy</a> &middot; <a href="#" data-ecura-cookie-prefs style="color:inherit;text-decoration:underline">Preferenze cookie</a>
    </p>
  </div>
</footer>
<script src="/vendor/bootstrap-5.3.3/bootstrap.bundle.min.js" defer></script>
<script defer>
document.getElementById('hamburgerWrap').addEventListener('click',function(){
  var n=document.querySelector('.top_nav_wrapper');
  n.classList.toggle('is-active');
  this.setAttribute('aria-expanded', n.classList.contains('is-active'));
});
</script>

<!-- ═══ WhatsApp CTA button fisso ════════════════════════════════════════ -->
<a href="https://wa.me/393357301206?text=Salve%2C%20vorrei%20informazioni%20sul%20bracciale%20eCura%20per%20anziani"
   target="_blank" rel="noopener noreferrer"
   aria-label="Contattaci su WhatsApp"
   style="position:fixed;bottom:24px;right:24px;z-index:9999;
          background:#25D366;color:#fff;border-radius:50px;
          padding:12px 20px;font-size:.95rem;font-weight:700;
          box-shadow:0 4px 16px rgba(37,211,102,.45);
          display:flex;align-items:center;gap:8px;
          text-decoration:none;transition:transform .2s"
   onmouseover="this.style.transform='scale(1.07)'" onmouseout="this.style.transform='scale(1)'">
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
  Scrivici su WhatsApp
</a>

</body></html>`;
}

function notFoundHtml(slug) {
  return `<!doctype html><html lang="it"><head><meta charset="utf-8">
<title>Articolo non trovato | eCura</title>
<link rel="stylesheet" href="/css/style.css">
</head><body>
<div style="text-align:center;padding:80px 20px">
  <h1>Articolo non trovato</h1>
  <p>L'articolo <em>${esc(slug)}</em> non esiste o non è ancora pubblicato.</p>
  <a href="/blog/">← Torna al Blog</a>
</div>
</body></html>`;
}
