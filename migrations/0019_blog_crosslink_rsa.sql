-- Migration 0019: cross-link verso il nuovo articolo 'Teleassistenza in RSA, residenze protette e Centri Alzheimer' (art. 10).
-- Per i 13 articoli già online: il link viene aggiunto in coda alla riga "Approfondimenti correlati" inserita dalla 0016 (nessun secondo blocco).
-- Per 4 dei nuovi articoli più pertinenti: riga "Approfondimenti correlati" in coda. Idempotente (instr(), perché D1 limita i pattern LIKE a 50 byte).

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'anziano-solo-casa-soluzioni-sicurezza'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'badante-vs-teleassistenza-costi-2026'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'bracciale-anziani-detraibile-19-percento'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'cadute-casa-anziani-statistiche-prevenzione'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'caregiver-distanza-genitori-anziani-estero'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'centrale-operativa-h24-teleassistenza'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'dispositivo-medico-classe-iia-anziani'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'ecura-vs-seremy-confronto-2026'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'gps-anziani-indoor-come-funziona'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'guida-bracciale-cadute-anziani-2026'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'prevenzione-cadute-anziani-10-consigli'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'sidly-care-recensioni-clienti-ecura'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = substr(content, 1, length(content) - 4) || ' · <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'teleassistenza-anziani-come-funziona-costi'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0
  AND substr(content, -4) = '</p>'
  AND instr(content, 'Approfondimenti correlati') > 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'demenza-wandering-anziano-esce-di-casa'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'polifarmacia-anziani-promemoria-farmaci'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'analisi-report-servizio-premium'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/">Teleassistenza in RSA, residenze protette e Centri Alzheimer</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'ai-predittiva-sicurezza-anziani'
  AND instr(content, 'href="/blog/teleassistenza-rsa-residenze-protette-centri-alzheimer/"') = 0;
