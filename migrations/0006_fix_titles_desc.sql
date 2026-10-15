-- Migration 0006: Fix titoli >60c e meta description >155c
-- Ahrefs Site Audit 15-ott-2026: 4 articoli D1 con titolo troppo lungo,
-- 1 articolo (caregiver) con description 230c (limite Ahrefs: 155c).
-- Il template blog/[slug].js aggiunge " | eCura" (8c) → titoli DB devono essere ≤52c.

UPDATE blog_articles
SET title = 'Dispositivo Medico Classe IIA: guida completa'
WHERE slug = 'dispositivo-medico-classe-iia-anziani';
-- Prima: "Dispositivo Medico Classe IIA: cosa significa per il tuo anziano" (63c → 71c totale)
-- Dopo:  "Dispositivo Medico Classe IIA: guida completa" (45c → 53c totale) ✓

UPDATE blog_articles
SET title = 'Centrale Operativa H24: come funziona davvero'
WHERE slug = 'centrale-operativa-h24-teleassistenza';
-- Prima: "Centrale Operativa H24 eCura: cosa succede quando l'anziano cade" (63c → 71c totale)
-- Dopo:  "Centrale Operativa H24: come funziona davvero" (45c → 53c totale) ✓

UPDATE blog_articles
SET title = 'Anziano Solo in Casa: soluzioni di sicurezza 2026'
WHERE slug = 'anziano-solo-casa-soluzioni-sicurezza';
-- Prima: "Anziano Solo in Casa: 7 soluzioni di sicurezza a confronto 2026" (62c → 70c totale)
-- Dopo:  "Anziano Solo in Casa: soluzioni di sicurezza 2026" (49c → 57c totale) ✓

UPDATE blog_articles
SET
  title       = 'Caregiver a Distanza: assistere i genitori anziani',
  description = 'Vivi all''estero e i tuoi genitori sono soli in Italia? Scopri eCura: GPS, cadute, app familiare, centrale H24 e SIM multi-provider UE inclusa.'
WHERE slug = 'caregiver-distanza-genitori-anziani-estero';
-- Titolo prima: "Caregiver a Distanza: come assistere i genitori anziani dall'estero nel 2026" (76c → 84c totale)
-- Titolo dopo:  "Caregiver a Distanza: assistere i genitori anziani" (50c → 58c totale) ✓
-- Desc prima: 230c (Ahrefs limit 155c)
-- Desc dopo:  142c ✓
