-- Rinomina articolo recensioni: slug senza "sidly"
-- vecchio: sidly-care-recensioni-clienti-ecura
-- nuovo:   recensioni-ecura-opinioni-clienti-2026
-- Aggiorna: slug, immagine hero, link interni nel contenuto di tutti gli articoli, related_N_slug.
-- Il vecchio URL resta raggiungibile con 301 (functions/blog/[slug].js, SLUG_REDIRECTS).

UPDATE blog_articles
SET slug = 'recensioni-ecura-opinioni-clienti-2026',
    hero_image = replace(hero_image, 'sidly-recensioni.jpg', 'recensioni-ecura-seremy-beghelli.jpg'),
    updated_at = datetime('now')
WHERE slug = 'sidly-care-recensioni-clienti-ecura';

UPDATE blog_articles
SET content = replace(replace(content,
        'sidly-care-recensioni-clienti-ecura', 'recensioni-ecura-opinioni-clienti-2026'),
        'sidly-recensioni.jpg', 'recensioni-ecura-seremy-beghelli.jpg')
WHERE instr(content, 'sidly-care-recensioni-clienti-ecura') > 0
   OR instr(content, 'sidly-recensioni.jpg') > 0;

UPDATE blog_articles SET related_1_slug = 'recensioni-ecura-opinioni-clienti-2026' WHERE related_1_slug = 'sidly-care-recensioni-clienti-ecura';
UPDATE blog_articles SET related_2_slug = 'recensioni-ecura-opinioni-clienti-2026' WHERE related_2_slug = 'sidly-care-recensioni-clienti-ecura';
UPDATE blog_articles SET related_3_slug = 'recensioni-ecura-opinioni-clienti-2026' WHERE related_3_slug = 'sidly-care-recensioni-clienti-ecura';
