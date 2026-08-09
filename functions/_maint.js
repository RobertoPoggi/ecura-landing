/**
 * Temporary maintenance endpoint for internal link updates.
 * Called once after deploy, then removed.
 * GET /_maint?k=ecura-il2026
 */
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  if (url.searchParams.get('k') !== 'ecura-il2026') {
    return new Response('forbidden', { status: 403 });
  }
  const db = env.DB;
  if (!db) return new Response('no db', { status: 500 });

  const updates = [
    // cadute-casa-anziani-statistiche-prevenzione → pillar cadute
    {
      slug: 'cadute-casa-anziani-statistiche-prevenzione',
      marker: 'article-cta',
      insert: `<div class="callout" style="margin:32px 0"><strong>📖 Approfondisci</strong><p>Vuoi una panoramica completa con statistiche OMS, 10 interventi di prevenzione e una checklist pratica? Leggi la nostra <a href="/guida-cadute-anziani/" style="color:#068D86;font-weight:600">Guida completa alle cadute anziani →</a></p></div>`
    },
    // prevenzione-cadute-anziani-10-consigli → pillar cadute
    {
      slug: 'prevenzione-cadute-anziani-10-consigli',
      marker: 'article-cta',
      insert: `<div class="callout" style="margin:32px 0"><strong>📖 Approfondisci</strong><p>Per il quadro completo — statistiche, tecnologie di rilevamento e teleassistenza H24 — visita la nostra <a href="/guida-cadute-anziani/" style="color:#068D86;font-weight:600">Guida completa alle cadute anziani →</a></p></div>`
    },
    // bracciale-anziani-detraibile-19-percento → pillar dispositivi medici
    {
      slug: 'bracciale-anziani-detraibile-19-percento',
      marker: 'article-cta',
      insert: `<div class="callout" style="margin:32px 0"><strong>📋 Guida completa</strong><p>Certificazioni MDR, confronto Classe IIA vs consumer, IVA 4% con L.104 e rimborsi INPS: tutto nella nostra <a href="/guida-dispositivi-medici-teleassistenza/" style="color:#068D86;font-weight:600">Guida ai Dispositivi Medici per Teleassistenza →</a></p></div>`
    },
    // dispositivo-medico-classe-iia-anziani → pillar dispositivi medici
    {
      slug: 'dispositivo-medico-classe-iia-anziani',
      marker: 'article-cta',
      insert: `<div class="callout" style="margin:32px 0"><strong>📋 Guida completa</strong><p>Detrazione 19%, IVA 4% (L.104), rimborso INPS e come verificare una certificazione: tutto nella <a href="/guida-dispositivi-medici-teleassistenza/" style="color:#068D86;font-weight:600">Guida ai Dispositivi Medici →</a></p></div>`
    },
    // gps-anziani-indoor-come-funziona → pillar bracciale eCura
    {
      slug: 'gps-anziani-indoor-come-funziona',
      marker: 'article-cta',
      insert: `<div class="callout" style="margin:32px 0"><strong>⌚ Come funziona eCura</strong><p>GPS multi-layer, AI per il rilevamento cadute, parametri vitali e Centrale H24: scopri tutto nella <a href="/come-funziona-bracciale-ecura/" style="color:#068D86;font-weight:600">Guida completa al bracciale eCura →</a></p></div>`
    },
    // teleassistenza-anziani-come-funziona-costi → pillar cadute + pillar bracciale
    {
      slug: 'teleassistenza-anziani-come-funziona-costi',
      marker: 'article-cta',
      insert: `<div class="callout" style="margin:32px 0"><strong>📖 Guide correlate</strong><p>Per capire meglio il contesto: <a href="/guida-cadute-anziani/" style="color:#068D86;font-weight:600">Guida completa alle cadute anziani →</a> e <a href="/come-funziona-bracciale-ecura/" style="color:#068D86;font-weight:600">Come funziona il bracciale eCura →</a></p></div>`
    },
    // ecura-vs-seremy-confronto-2026 → pillar bracciale + pillar dispositivi
    {
      slug: 'ecura-vs-seremy-confronto-2026',
      marker: 'article-cta',
      insert: `<div class="callout" style="margin:32px 0"><strong>📚 Guide di approfondimento</strong><p>Scopri tutti i dettagli: <a href="/come-funziona-bracciale-ecura/" style="color:#068D86;font-weight:600">Come funziona il bracciale eCura →</a> e <a href="/guida-dispositivi-medici-teleassistenza/" style="color:#068D86;font-weight:600">Certificazioni MDR e detrazioni →</a></p></div>`
    },
  ];

  const results = [];
  for (const u of updates) {
    try {
      const row = await db.prepare('SELECT content FROM blog_articles WHERE slug = ?').bind(u.slug).first();
      if (!row) { results.push({ slug: u.slug, status: 'not_found' }); continue; }
      
      // Check if already has this pillar link to avoid duplicates
      const alreadyLinked = row.content.includes(u.insert.substring(50, 100));
      if (alreadyLinked) { results.push({ slug: u.slug, status: 'already_done' }); continue; }

      // Insert the callout before the article-cta div (at end of article body)
      let newContent;
      if (row.content.includes(`class="article-cta"`)) {
        newContent = row.content.replace(`<div class="article-cta"`, u.insert + `\n<div class="article-cta"`);
      } else {
        newContent = row.content + '\n' + u.insert;
      }
      
      await db.prepare('UPDATE blog_articles SET content = ?, updated_at = datetime("now") WHERE slug = ?')
        .bind(newContent, u.slug).run();
      results.push({ slug: u.slug, status: 'updated' });
    } catch(e) {
      results.push({ slug: u.slug, status: 'error', msg: e.message });
    }
  }

  return new Response(JSON.stringify({ success: true, results }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
