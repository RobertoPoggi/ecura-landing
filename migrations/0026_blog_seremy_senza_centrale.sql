-- 0026: Seremy non ha una centrale operativa H24 (gli allarmi vanno solo ai familiari via app): allinea articolo recensioni Seremy.

UPDATE blog_articles SET content = replace(content, '<li><strong>Centrale operativa H24:</strong> ✅ Sì</li>', '<li><strong>Centrale operativa H24:</strong> ❌ No — gli allarmi vanno solo ai familiari via app</li>') WHERE slug = 'seremy-recensioni-2026';

UPDATE blog_articles SET content = replace(content, '<li>Centrale operativa reattiva</li>', '') WHERE slug = 'seremy-recensioni-2026';

UPDATE blog_articles SET content = replace(content, '<tr><td>Centrale operativa H24</td><td class="text-center">✅ Sì</td><td class="text-center">✅ Italiana H24</td></tr>', '<tr><td>Centrale operativa H24</td><td class="text-center">❌ No (solo app familiari)</td><td class="text-center">✅ Italiana H24</td></tr>') WHERE slug = 'seremy-recensioni-2026';

UPDATE blog_articles SET content = replace(content, 'Seremy è un prodotto funzionale con una buona centrale operativa.', 'Seremy è un prodotto funzionale, ma senza centrale operativa H24: gli allarmi vanno solo ai familiari via app.') WHERE slug = 'seremy-recensioni-2026';
