-- Elimina l'articolo duplicato "recensioni" (slug attuale: recensioni-ecura-opinioni-clienti-2026,
-- ex sidly-care-recensioni-clienti-ecura) e rimuove tutti i crosslink verso di esso.
-- Gli URL vecchi fanno 301 verso /blog/ecura-vs-seremy-confronto-2026/ (functions/blog/[slug].js).

-- 1) link inline nel testo: resta il testo, senza link
UPDATE blog_articles
SET content = replace(content,
      '<a href="/blog/recensioni-ecura-opinioni-clienti-2026/">recensioni dei clienti eCura</a>',
      'recensioni dei clienti eCura')
WHERE instr(content, '<a href="/blog/recensioni-ecura-opinioni-clienti-2026/">recensioni dei clienti eCura</a>') > 0;

-- 2) voce di elenco "Dati eCura sulle recensioni verificate" (fonti): rimossa
UPDATE blog_articles
SET content = replace(content,
      '<li>Dati eCura sulle recensioni verificate dei clienti — <a href="/blog/recensioni-ecura-opinioni-clienti-2026/">eCura Recensioni 2026</a>.</li>' || char(10),
      '')
WHERE instr(content, '<li>Dati eCura sulle recensioni verificate dei clienti — <a href="/blog/recensioni-ecura-opinioni-clienti-2026/">eCura Recensioni 2026</a>.</li>') > 0;

-- 3) "Potrebbe interessarti anche": sostituisce la card con la Guida bracciali cadute
UPDATE blog_articles SET
  related_1_slug = 'guida-bracciale-cadute-anziani-2026',
  related_1_title = 'Guida bracciali cadute anziani 2026',
  related_1_excerpt = 'Come scegliere il bracciale giusto: GPS, certificazione, autonomia e prezzo.',
  related_1_tag = 'Guida'
WHERE related_1_slug = 'recensioni-ecura-opinioni-clienti-2026';
UPDATE blog_articles SET
  related_2_slug = 'guida-bracciale-cadute-anziani-2026',
  related_2_title = 'Guida bracciali cadute anziani 2026',
  related_2_excerpt = 'Come scegliere il bracciale giusto: GPS, certificazione, autonomia e prezzo.',
  related_2_tag = 'Guida'
WHERE related_2_slug = 'recensioni-ecura-opinioni-clienti-2026';
UPDATE blog_articles SET
  related_3_slug = 'guida-bracciale-cadute-anziani-2026',
  related_3_title = 'Guida bracciali cadute anziani 2026',
  related_3_excerpt = 'Come scegliere il bracciale giusto: GPS, certificazione, autonomia e prezzo.',
  related_3_tag = 'Guida'
WHERE related_3_slug = 'recensioni-ecura-opinioni-clienti-2026';

-- 4) eliminazione dell'articolo
DELETE FROM blog_articles WHERE slug = 'recensioni-ecura-opinioni-clienti-2026';
