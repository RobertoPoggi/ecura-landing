-- 0023: eCura descritto come servizio che si avvale di un dispositivo medico Classe IIA (BD/RDM 2853300);
-- rimossi numero di certificato e riferimento IMQ/EUDAMED non verificabili. Seremy/Beghelli invariati.

UPDATE blog_articles SET content = replace(content, 'Il bracciale eCura è certificato Dispositivo Medico Classe IIA (certificato n. IT/CA08/2024/0142) — questa è la condizione necessaria per la detrazione.', 'Il dispositivo di cui si avvale il servizio eCura è un Dispositivo Medico Classe IIA, iscritto nella Banca Dati del Ministero della Salute con numero BD/RDM 2853300 — questa è la condizione necessaria per la detrazione.') WHERE slug = 'bracciale-anziani-detraibile-19-percento';

UPDATE blog_articles SET content = replace(content, '2. Certificato CE Dispositivo Medico (disponibile sul sito eCura)', '2. Documentazione del dispositivo medico (numero BD/RDM 2853300, indicato nel contratto e in fattura)') WHERE slug = 'bracciale-anziani-detraibile-19-percento';

UPDATE blog_articles SET summary = replace(summary, 'Il bracciale eCura è detraibile al 19% come spesa medica perché è certificato Dispositivo Medico Classe IIA.', 'Il servizio eCura è detraibile al 19% come spesa medica perché si avvale di un Dispositivo Medico Classe IIA.') WHERE slug = 'bracciale-anziani-detraibile-19-percento';

UPDATE blog_articles SET content = replace(content, 'Cerca il nome del dispositivo o del produttore.

Il bracciale eCura è registrato su EUDAMED con il numero di certificato IT/CA08/2024/0142, rilasciato dall Organismo Notificato IMQ (Istituto Italiano del Marchio di Qualità).', 'Cerca il nome del dispositivo o del produttore.

In Italia puoi consultare anche il Repertorio dei dispositivi medici del Ministero della Salute. Il dispositivo di cui si avvale il servizio eCura è iscritto con numero BD/RDM 2853300 (Classe IIA): lo stesso numero è riportato nel contratto e in fattura.') WHERE slug = 'dispositivo-medico-classe-iia-anziani';

UPDATE blog_articles SET content = replace(content, 'Il bracciale eCura è certificato Dispositivo Medico Classe IIA — la stessa classe', 'Il servizio eCura si avvale di un bracciale Dispositivo Medico Classe IIA (BD/RDM 2853300) — la stessa classe') WHERE slug = 'guida-bracciale-cadute-anziani-2026';

UPDATE blog_articles SET content = replace(content, 'eCura è certificato Dispositivo Medico Classe IIA ai sensi del Regolamento UE MDR 2017/745.', 'Il servizio eCura si avvale di un dispositivo medico Classe IIA ai sensi del Regolamento UE MDR 2017/745 (BD/RDM 2853300).') WHERE slug = 'ecura-vs-seremy-confronto-2026';

UPDATE blog_articles SET content = replace(content, 'eCura è l''unico bracciale per anziani in Italia certificato <strong>dispositivo medico Classe IIA</strong> (BD/RDM 2853300)', 'eCura è l''unico servizio di teleassistenza per anziani in Italia che si avvale di un <strong>dispositivo medico Classe IIA</strong> (BD/RDM 2853300)') WHERE slug = 'caregiver-distanza-genitori-anziani-estero';

UPDATE blog_articles SET content = replace(content, 'Un bracciale come eCura certificato Dispositivo Medico Classe IIA rileva', 'Un servizio come eCura, che si avvale di un bracciale Dispositivo Medico Classe IIA, rileva') WHERE slug = 'prevenzione-cadute-anziani-10-consigli';

UPDATE blog_articles SET content = replace(content, 'ed è certificato Dispositivo Medico Classe IIA — non un semplice wearable', 'e si avvale di un bracciale Dispositivo Medico Classe IIA — non un semplice wearable') WHERE slug = 'prevenzione-cadute-anziani-10-consigli';
