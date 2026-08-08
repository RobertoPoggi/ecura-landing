/**
 * Pages Function: /blog/[slug]  e  /blog/[slug]/
 * Serve ogni articolo direttamente da D1 — così le modifiche
 * dal pannello admin si riflettono immediatamente sul sito pubblico.
 */

export async function onRequest({ request, env, params }) {
  const db = env.DB;
  if (!db) return passThrough(request); // fallback sicuro se DB non è bound

  const slug = (params.slug || '').replace(/\/+$/, '');
  if (!slug) return passThrough(request);

  let article;
  try {
    article = await db.prepare(
      'SELECT * FROM blog_articles WHERE slug = ? AND status = ?'
    ).bind(slug, 'published').first();
  } catch (e) {
    return passThrough(request);
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

/** Se qualcosa va storto, lascia passare la richiesta al file statico */
function passThrough(request) {
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

function renderArticle(a) {
  const title   = decodeEntities(a.title || '');
  const desc    = decodeEntities(a.description || '');
  const content = decodeEntities(a.content || '');
  const hero    = a.hero_image || '/img/blog/default.jpg';
  const heroAlt = decodeEntities(a.hero_image_alt || title);
  const cat     = decodeEntities(a.category || '');
  const color   = a.tag_color || '#068D86';
  const author  = decodeEntities(a.author || 'Redazione eCura');
  const date    = fmtDate(a.date_published);
  const read    = decodeEntities(a.read_time || '');
  const slug    = a.slug || '';
  const canonical = `https://www.ecura.it/blog/${slug}/`;

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

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | eCura</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:locale" content="it_IT">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="eCura - Teleassistenza Anziani">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(hero)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(hero)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;600;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;600;700&display=swap"></noscript>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"></noscript>
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/blog.css">
<style>
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
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": ${JSON.stringify(title)},
      "description": ${JSON.stringify(desc)},
      "url": "${canonical}",
      "datePublished": "${a.date_published || ''}",
      "dateModified": "${a.date_modified || a.updated_at || ''}",
      "author": {"@type":"Organization","name":"Medica GB Srl","url":"https://www.ecura.it"},
      "publisher": {"@type":"Organization","name":"eCura by Medica GB","logo":{"@type":"ImageObject","url":"https://www.ecura.it/img/logo.png","width":110,"height":36}},
      "image": {"@type":"ImageObject","url":"${esc(hero)}","width":1200,"height":630},
      "mainEntityOfPage": {"@type":"WebPage","@id":"${canonical}"},
      "inLanguage": "it-IT"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type":"ListItem","position":1,"name":"Home","item":"https://www.ecura.it/"},
        {"@type":"ListItem","position":2,"name":"Blog","item":"https://www.ecura.it/blog/"},
        {"@type":"ListItem","position":3,"name":${JSON.stringify(title)},"item":"${canonical}"}
      ]
    }
  ]
}
</script>
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
  <img src="${esc(hero)}" alt="${esc(heroAlt)}" class="article-hero-img" loading="eager" decoding="async"
    style="width:100%;height:auto;border-radius:10px;margin:20px 0 28px;display:block;object-fit:cover;aspect-ratio:16/8"
    onerror="this.src='/img/blog/default.jpg'">
  <div class="article-body">
    ${content}
  </div>
  <div class="article-cta">
    <h3>Proteggi i tuoi cari con eCura</h3>
    <p>Dispositivo medico certificato Classe IIA. GPS indoor+outdoor. Centrale operativa H24. Detraibile al 19%.</p>
    <a href="/#pricingPlan">Scopri i Piani eCura &rarr;</a>
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
        </ul>
      </div>
      <div class="col-md-4">
        <h4 style="font-size:.95rem;color:#fff;margin-bottom:12px">Contatti</h4>
        <p style="font-size:.85rem;color:rgba(255,255,255,.7)">Medica GB Srl<br>Corso Giuseppe Garibaldi 34<br>20121 Milano<br>
          <a href="tel:+393357301206" style="color:#068D86">+39 335 730 1206</a><br>
          <a href="mailto:info@ecura.it" style="color:#068D86">info@ecura.it</a></p>
      </div>
    </div>
    <hr style="border-color:rgba(255,255,255,.15);margin:28px 0 16px">
    <p style="font-size:.78rem;color:rgba(255,255,255,.5);text-align:center;margin:0">
      &copy; 2026 Medica GB Srl &mdash; P.IVA 12524360964 &mdash; Tutti i diritti riservati.<br>
      eCura &egrave; un dispositivo medico Classe IIA ai sensi del Regolamento UE MDR 2017/745.
    </p>
  </div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
<script defer>
document.getElementById('hamburgerWrap').addEventListener('click',function(){
  var n=document.querySelector('.top_nav_wrapper');
  n.classList.toggle('is-active');
  this.setAttribute('aria-expanded', n.classList.contains('is-active'));
});
</script>
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
