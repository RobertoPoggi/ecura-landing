-- Migration 0016: cross-link dai 13 articoli già online verso i 9 nuovi articoli.
-- Aggiunge in coda a ogni articolo la riga "Approfondimenti correlati" (Opzione B del file
-- ecura-crosslink-articoli-esistenti.html). Idempotente (instr, perche D1 limita i pattern LIKE a 50 byte): non aggiunge due volte lo stesso blocco.

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/convincere-genitore-anziano-bracciale/">Come convincere un genitore anziano ad accettare il bracciale: 7 strategie che funzionano</a> · <a href="/blog/demenza-wandering-anziano-esce-di-casa/">Anziano con demenza che esce di casa da solo: cause, rischi e cosa fare</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'anziano-solo-casa-soluzioni-sicurezza'
  AND instr(content, 'href="/blog/convincere-genitore-anziano-bracciale/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/bonus-agevolazioni-anziani-2026/">Bonus e agevolazioni per gli anziani nel 2026: la guida completa</a> · <a href="/blog/analisi-report-servizio-premium/">Analisi e report di salute nel servizio eCura Premium: come leggere i dati dei tuoi genitori</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'badante-vs-teleassistenza-costi-2026'
  AND instr(content, 'href="/blog/bonus-agevolazioni-anziani-2026/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/bonus-agevolazioni-anziani-2026/">Bonus e agevolazioni per gli anziani nel 2026: la guida completa</a> · <a href="/blog/analisi-report-servizio-premium/">Analisi e report di salute nel servizio eCura Premium: come leggere i dati dei tuoi genitori</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'bracciale-anziani-detraibile-19-percento'
  AND instr(content, 'href="/blog/bonus-agevolazioni-anziani-2026/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/cadute-in-bagno-anziani-prevenzione/">Cadute in bagno: perché sono le più pericolose e come rendere il bagno sicuro</a> · <a href="/blog/cadute-post-dimissione-ospedale-prevenzione/">Il genitore torna a casa dall’ospedale: come prevenire le cadute nei primi 30 giorni</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'cadute-casa-anziani-statistiche-prevenzione'
  AND instr(content, 'href="/blog/cadute-in-bagno-anziani-prevenzione/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/analisi-report-servizio-premium/">Analisi e report di salute nel servizio eCura Premium: come leggere i dati dei tuoi genitori</a> · <a href="/blog/convincere-genitore-anziano-bracciale/">Come convincere un genitore anziano ad accettare il bracciale: 7 strategie che funzionano</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'caregiver-distanza-genitori-anziani-estero'
  AND instr(content, 'href="/blog/analisi-report-servizio-premium/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/ai-predittiva-sicurezza-anziani/">AI predittiva per la sicurezza degli anziani: come funziona e cosa (non) fa</a> · <a href="/blog/cadute-post-dimissione-ospedale-prevenzione/">Il genitore torna a casa dall’ospedale: come prevenire le cadute nei primi 30 giorni</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'centrale-operativa-h24-teleassistenza'
  AND instr(content, 'href="/blog/ai-predittiva-sicurezza-anziani/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/ai-predittiva-sicurezza-anziani/">AI predittiva per la sicurezza degli anziani: come funziona e cosa (non) fa</a> · <a href="/blog/analisi-report-servizio-premium/">Analisi e report di salute nel servizio eCura Premium: come leggere i dati dei tuoi genitori</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'dispositivo-medico-classe-iia-anziani'
  AND instr(content, 'href="/blog/ai-predittiva-sicurezza-anziani/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/analisi-report-servizio-premium/">Analisi e report di salute nel servizio eCura Premium: come leggere i dati dei tuoi genitori</a> · <a href="/blog/ai-predittiva-sicurezza-anziani/">AI predittiva per la sicurezza degli anziani: come funziona e cosa (non) fa</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'ecura-vs-seremy-confronto-2026'
  AND instr(content, 'href="/blog/analisi-report-servizio-premium/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/demenza-wandering-anziano-esce-di-casa/">Anziano con demenza che esce di casa da solo: cause, rischi e cosa fare</a> · <a href="/blog/analisi-report-servizio-premium/">Analisi e report di salute nel servizio eCura Premium: come leggere i dati dei tuoi genitori</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'gps-anziani-indoor-come-funziona'
  AND instr(content, 'href="/blog/demenza-wandering-anziano-esce-di-casa/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/cadute-in-bagno-anziani-prevenzione/">Cadute in bagno: perché sono le più pericolose e come rendere il bagno sicuro</a> · <a href="/blog/cadute-post-dimissione-ospedale-prevenzione/">Il genitore torna a casa dall’ospedale: come prevenire le cadute nei primi 30 giorni</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'guida-bracciale-cadute-anziani-2026'
  AND instr(content, 'href="/blog/cadute-in-bagno-anziani-prevenzione/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/cadute-in-bagno-anziani-prevenzione/">Cadute in bagno: perché sono le più pericolose e come rendere il bagno sicuro</a> · <a href="/blog/cadute-post-dimissione-ospedale-prevenzione/">Il genitore torna a casa dall’ospedale: come prevenire le cadute nei primi 30 giorni</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'prevenzione-cadute-anziani-10-consigli'
  AND instr(content, 'href="/blog/cadute-in-bagno-anziani-prevenzione/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/convincere-genitore-anziano-bracciale/">Come convincere un genitore anziano ad accettare il bracciale: 7 strategie che funzionano</a> · <a href="/blog/regalo-genitore-anziano-natale/">Regalo a un genitore anziano che ha tutto: 12 idee davvero utili (2026)</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'sidly-care-recensioni-clienti-ecura'
  AND instr(content, 'href="/blog/convincere-genitore-anziano-bracciale/"') = 0;

UPDATE blog_articles
SET content = content || char(10) || '<p><strong>Approfondimenti correlati:</strong> <a href="/blog/bonus-agevolazioni-anziani-2026/">Bonus e agevolazioni per gli anziani nel 2026: la guida completa</a> · <a href="/blog/analisi-report-servizio-premium/">Analisi e report di salute nel servizio eCura Premium: come leggere i dati dei tuoi genitori</a></p>',
    date_modified = '2026-10-23',
    updated_at = datetime('now')
WHERE slug = 'teleassistenza-anziani-come-funziona-costi'
  AND instr(content, 'href="/blog/bonus-agevolazioni-anziani-2026/"') = 0;
