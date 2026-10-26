-- Migration 0028: cross-link verso la guida 'Come scegliere un servizio di teleassistenza' (art. 11).
-- Articoli con riga "Approfondimenti correlati": il link è accodato alla riga esistente. Articoli senza riga: riga nuova in coda.
-- Confronto eCura vs Seremy: frase mirata. Idempotente (instr(), perché D1 limita i pattern LIKE a 50 byte).

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'ai-predittiva-sicurezza-anziani'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'analisi-report-servizio-premium'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'anziano-solo-casa-soluzioni-sicurezza'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'badante-vs-teleassistenza-costi-2026'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'bracciale-anziani-detraibile-19-percento'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'cadute-casa-anziani-statistiche-prevenzione'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'caregiver-distanza-genitori-anziani-estero'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'centrale-operativa-h24-teleassistenza'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'demenza-wandering-anziano-esce-di-casa'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'dispositivo-medico-classe-iia-anziani'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'gps-anziani-indoor-come-funziona'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'guida-bracciale-cadute-anziani-2026'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'polifarmacia-anziani-promemoria-farmaci'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'prevenzione-cadute-anziani-10-consigli'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'teleassistenza-anziani-come-funziona-costi'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'bonus-agevolazioni-anziani-2026'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'cadute-in-bagno-anziani-prevenzione'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'cadute-post-dimissione-ospedale-prevenzione'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'convincere-genitore-anziano-bracciale'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'regalo-genitore-anziano-natale'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/come-scegliere-servizio-teleassistenza/">Come scegliere un servizio di teleassistenza: criteri, categorie e costi</a></p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'teleassistenza-rsa-residenze-protette-centri-alzheimer'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0;

-- Confronto eCura vs Seremy: frase mirata nel riquadro "Guide di approfondimento".
UPDATE blog_articles
SET content = replace(content, 'Certificazioni MDR e detrazioni →</a></p></div>', 'Certificazioni MDR e detrazioni →</a></p><p style="margin-top:8px">Se state valutando, la <a href="/blog/come-scegliere-servizio-teleassistenza/">guida alla scelta con la tabella di confronto tra le categorie</a> elenca i sette criteri e le domande da porre a qualunque fornitore.</p></div>'),
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'ecura-vs-seremy-confronto-2026'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0;

-- Fallback: se il riquadro non fosse stato trovato, la frase viene aggiunta in coda.
UPDATE blog_articles
SET content = content || char(10) || '<p style="margin-top:8px">Se state valutando, la <a href="/blog/come-scegliere-servizio-teleassistenza/">guida alla scelta con la tabella di confronto tra le categorie</a> elenca i sette criteri e le domande da porre a qualunque fornitore.</p>',
    date_modified = '2026-10-26',
    updated_at = datetime('now')
WHERE slug = 'ecura-vs-seremy-confronto-2026'
  AND instr(content, 'href="/blog/come-scegliere-servizio-teleassistenza/"') = 0;
