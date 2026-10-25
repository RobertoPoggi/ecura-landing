-- 0024: prezzo Seremy uniformato a 349 EUR/anno (una sola licenza app); eCura include licenze app per tutti gli utenti necessari.

UPDATE blog_articles SET content = replace(content, 'Seremy SMART: 360/anno (30/mese) — non detraibile come DM
Differenza effettiva dopo detrazione: eCura costa circa 5/anno in meno di Seremy.', 'Seremy (una sola licenza app): 349/anno (29/mese) — non detraibile come DM
Differenza effettiva dopo detrazione: eCura costa circa 33/anno in meno di Seremy, con licenze app disponibili per tutti gli utenti necessari.') WHERE slug = 'ecura-vs-seremy-confronto-2026';

UPDATE blog_articles SET content = replace(content, 'centrale operativa esternalizzata, app base, 360/anno.', 'centrale operativa esternalizzata, app base, 349/anno (una sola licenza app).') WHERE slug = 'ecura-vs-seremy-confronto-2026';

UPDATE blog_articles SET description = replace(description, 'Prezzo €480/anno, senza detraibilità fiscale.', 'Prezzo €349/anno (una sola licenza app), senza detraibilità fiscale.') WHERE slug = 'seremy-recensioni-2026';

UPDATE blog_articles SET content = replace(content, '~€480/anno (piano base)</li>', '~€349/anno (piano base, una sola licenza app)</li>') WHERE slug = 'seremy-recensioni-2026';

UPDATE blog_articles SET content = replace(content, 'è di circa <strong>€480/anno</strong> per il piano base con centrale operativa H24. Questo lo rende uno dei dispositivi di teleassistenza più costosi sul mercato italiano, soprattutto considerando che <strong>il costo non è detraibile fiscalmente</strong>.', 'è di circa <strong>€349/anno</strong> per il piano base, con una sola licenza app. Il <strong>costo non è detraibile fiscalmente</strong>.') WHERE slug = 'seremy-recensioni-2026';

UPDATE blog_articles SET content = replace(content, 'Il costo netto effettivo scende a circa €316/anno — ovvero <strong>€164/anno in meno di Seremy</strong>.', 'Il costo netto effettivo scende a circa €316/anno — ovvero <strong>circa €33/anno in meno di Seremy</strong>, con licenze app disponibili per tutti gli utenti necessari.') WHERE slug = 'seremy-recensioni-2026';

UPDATE blog_articles SET content = replace(content, '<li>Prezzo elevato (~€480/anno) senza detraibilità</li>', '<li>Una sola licenza app per ~€349/anno, senza detraibilità</li>') WHERE slug = 'seremy-recensioni-2026';

UPDATE blog_articles SET content = replace(content, '<td class="text-center text-danger fw-bold">~€480</td>', '<td class="text-center text-danger fw-bold">~€349 (una sola licenza app)</td>') WHERE slug = 'seremy-recensioni-2026';

UPDATE blog_articles SET content = replace(content, 'al prezzo di <strong>~€480/anno senza detraibilità</strong>, il rapporto qualità-prezzo risulta sfavorevole rispetto ad alternative certificate come eCura.', 'a <strong>~€349/anno per una sola licenza app e senza detraibilità</strong>, il rapporto qualità-prezzo risulta meno favorevole rispetto ad alternative con dispositivo certificato come eCura (€316 netti, licenze app per tutti gli utenti necessari).') WHERE slug = 'seremy-recensioni-2026';

UPDATE blog_articles SET content = replace(content, 'Seremy costa circa €480/anno (piano base).', 'Seremy costa circa €349/anno (piano base, una sola licenza app).') WHERE slug = 'seremy-recensioni-2026';
