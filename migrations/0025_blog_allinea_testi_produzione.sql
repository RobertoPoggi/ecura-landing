-- 0025: allinea al testo realmente in produzione (D1 modificato manualmente): eCura come servizio che si avvale di dispositivo certificato; prezzo Seremy 349 EUR/anno (una sola licenza app).

UPDATE blog_articles SET content = replace(content, 'Seremy rimane intorno a €420/anno', 'Seremy costa circa €349/anno (una sola licenza app)') WHERE slug = 'ecura-vs-seremy-confronto-2026';

UPDATE blog_articles SET content = replace(content, '~€420/anno', '~€349/anno (una sola licenza app)') WHERE slug = 'ecura-vs-seremy-confronto-2026';

UPDATE blog_articles SET content = replace(content, 'Solo eCura è <strong>certificato dispositivo medico Classe IIA</strong>', 'Solo eCura è un servizio che si avvale di un <strong>dispositivo medico certificato Classe IIA</strong>') WHERE slug = 'ecura-vs-seremy-confronto-2026';

UPDATE blog_articles SET content = replace(content, 'eCura è certificato dispositivo medico Classe IIA (BD/RDM 2853300)', 'il servizio eCura si avvale di un dispositivo medico certificato Classe IIA (BD/RDM 2853300)') WHERE slug = 'ecura-vs-seremy-confronto-2026';

UPDATE blog_articles SET content = replace(content, 'Unico dispositivo medico certificato Classe IIA', 'Servizio con dispositivo medico certificato Classe IIA') WHERE slug = 'ecura-vs-seremy-confronto-2026';

UPDATE blog_articles SET content = replace(content, 'unico bracciale anziani certificato Classe IIA', 'unico servizio di teleassistenza con dispositivo medico Classe IIA') WHERE slug = 'ecura-vs-seremy-confronto-2026';

UPDATE blog_articles SET content = replace(content, 'eCura è certificato Dispositivo Medico Classe IIA (MDR 2017/745)', 'Il servizio eCura si avvale di un Dispositivo Medico certificato Classe IIA (MDR 2017/745)') WHERE slug = 'bracciale-anziani-detraibile-19-percento';

UPDATE blog_articles SET content = replace(content, 'eCura è certificato Dispositivo Medico Classe IIA (BD/RDM 2853300, MDR 2017/745)', 'Il servizio eCura si avvale di un Dispositivo Medico certificato Classe IIA (BD/RDM 2853300, MDR 2017/745)') WHERE slug = 'bracciale-anziani-detraibile-19-percento';

UPDATE blog_articles SET content = replace(content, 'eCura è certificato Dispositivo Medico Classe IIA ai sensi del Regolamento MDR 2017/745, con numero di registrazione nel database europeo BD/RDM 2853300', 'Il servizio eCura si avvale di un Dispositivo Medico certificato Classe IIA ai sensi del Regolamento MDR 2017/745, con numero di registrazione BD/RDM 2853300 nel Repertorio dei Dispositivi Medici del Ministero della Salute') WHERE slug = 'dispositivo-medico-classe-iia-anziani';

UPDATE blog_articles SET content = replace(content, 'Tutti e tre i servizi eCura sono certificati Classe IIA', 'Tutti e tre i servizi eCura si avvalgono di dispositivi certificati Classe IIA') WHERE slug = 'dispositivo-medico-classe-iia-anziani';

UPDATE blog_articles SET content = replace(content, 'sono certificati Dispositivo Medico Classe IIA, numero di registrazione BD/RDM 2853300', 'si avvalgono di un dispositivo medico certificato Classe IIA, numero di registrazione BD/RDM 2853300') WHERE slug = 'guida-bracciale-cadute-anziani-2026';

UPDATE blog_articles SET content = replace(content, 'unico servizio italiano certificato Dispositivo Medico Classe IIA', 'unico servizio italiano che si avvale di un Dispositivo Medico certificato Classe IIA') WHERE slug = 'teleassistenza-anziani-come-funziona-costi';

UPDATE blog_articles SET content = replace(content, 'eCura invece è certificato Classe IIA', 'eCura invece si avvale di un dispositivo certificato Classe IIA') WHERE slug = 'seremy-recensioni-2026';

UPDATE blog_articles SET content = replace(content, 'eCura — La scelta certificata', 'eCura — La scelta con dispositivo certificato') WHERE slug = 'seremy-recensioni-2026';
