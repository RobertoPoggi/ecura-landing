-- 0030: FAQ visibili (estratte come FAQPage JSON-LD dal renderer), fonti istituzionali, rimozione di dati non verificati e correzioni di accuratezza.
UPDATE blog_articles SET content = replace(content, '<h2>Domande frequenti sulla teleassistenza</h2>

', '<h2>Domande frequenti sulla teleassistenza</h2>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Cos''è la teleassistenza per anziani?</strong>
  <p style="margin:8px 0 0">È un servizio che collega l''anziano a una Centrale Operativa attiva 24 ore su 24 tramite un dispositivo indossabile con pulsante SOS e, nei servizi più completi, rilevamento automatico delle cadute e GPS. Se scatta l''allarme, la centrale chiama l''anziano, avvisa i familiari e, se necessario, allerta i soccorsi.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Come funziona il bracciale cadute nella teleassistenza?</strong>
  <p style="margin:8px 0 0">Sensori di movimento e un algoritmo AI distinguono una caduta da un gesto normale. Se rileva una caduta il bracciale emette un allarme vocale e, se l''anziano non risponde entro 30 secondi, allerta la Centrale Operativa H24 (piani AVANZATO) con la posizione GPS. Funziona anche se l''anziano è privo di sensi. Approfondimento: <a href="/blog/guida-bracciale-cadute-anziani-2026/">guida ai bracciali cadute anziani</a>.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Quanto costa la teleassistenza per anziani con eCura?</strong>
  <p style="margin:8px 0 0">I servizi eCura partono da €390/anno (Family BASE); il piano con Centrale Operativa H24 (Family AVANZATO) costa €690/anno. I prezzi dei sei piani sono nella tabella sopra e sono detraibili al 19% come spesa sanitaria.</p>
</div>

'), date_modified = '2026-10-28', updated_at = datetime('now') WHERE slug = 'teleassistenza-anziani-come-funziona-costi' AND instr(content, '<h2>Domande frequenti sulla teleassistenza</h2>

') > 0 AND instr(content, '<h2>Domande frequenti sulla teleassistenza</h2>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Cos''è la teleassistenza per anziani?</strong>
  <p style="margin:8px 0 0">È un servizio che collega l''anziano a una Centrale Operativa attiva 24 ore su 24 tramite un dispositivo indossabile con pulsante SOS e, nei servizi più completi, rilevamento automatico delle cadute e GPS. Se scatta l''allarme, la centrale chiama l''anziano, avvisa i familiari e, se necessario, allerta i soccorsi.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Come funziona il bracciale cadute nella teleassistenza?</strong>
  <p style="margin:8px 0 0">Sensori di movimento e un algoritmo AI distinguono una caduta da un gesto normale. Se rileva una caduta il bracciale emette un allarme vocale e, se l''anziano non risponde entro 30 secondi, allerta la Centrale Operativa H24 (piani AVANZATO) con la posizione GPS. Funziona anche se l''anziano è privo di sensi. Approfondimento: <a href="/blog/guida-bracciale-cadute-anziani-2026/">guida ai bracciali cadute anziani</a>.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Quanto costa la teleassistenza per anziani con eCura?</strong>
  <p style="margin:8px 0 0">I servizi eCura partono da €390/anno (Family BASE); il piano con Centrale Operativa H24 (Family AVANZATO) costa €690/anno. I prezzi dei sei piani sono nella tabella sopra e sono detraibili al 19% come spesa sanitaria.</p>
</div>

') = 0;
UPDATE blog_articles SET content = replace(content, '<p><strong>Approfondimenti correlati:</strong>', '<p class="fonti" style="font-size:.85rem;color:#555;margin:20px 0"><strong>Fonti e riferimenti:</strong> <a href="https://eur-lex.europa.eu/eli/reg/2017/745/oj" rel="noopener" target="_blank">Regolamento (UE) 2017/745 (MDR)</a> · <a href="https://www.salute.gov.it/portale/dispositivi/homeBancaDatiDispositivi.jsp" rel="noopener" target="_blank">Ministero della Salute — Banca dati dispositivi medici</a> · <a href="https://www.agenziaentrate.gov.it/" rel="noopener" target="_blank">Agenzia delle Entrate</a></p>

<p><strong>Approfondimenti correlati:</strong>'), date_modified = '2026-10-28', updated_at = datetime('now') WHERE slug = 'teleassistenza-anziani-come-funziona-costi' AND instr(content, '<p><strong>Approfondimenti correlati:</strong>') > 0 AND instr(content, '<p class="fonti" style="font-size:.85rem;color:#555;margin:20px 0"><strong>Fonti e riferimenti:</strong> <a href="https://eur-lex.europa.eu/eli/reg/2017/745/oj" rel="noopener" target="_blank">Regolamento (UE) 2017/745 (MDR)</a> · <a href="https://www.salute.gov.it/portale/dispositivi/homeBancaDatiDispositivi.jsp" rel="noopener" target="_blank">Ministero della Salute — Banca dati dispositivi medici</a> · <a href="https://www.agenziaentrate.gov.it/" rel="noopener" target="_blank">Agenzia delle Entrate</a></p>

<p><strong>Approfondimenti correlati:</strong>') = 0;
UPDATE blog_articles SET content = replace(content, '<h2>Domande frequenti sui bracciali anti-caduta</h2><p><strong style="background-color: rgb(247, 255, 254);">Il bracciale rileva le cadute anche di notte?</strong><span style="background-color: rgb(247, 255, 254);">Sì. Il rilevamento automatico è attivo 24 ore su 24, 7 giorni su 7. Non richiede che l''assistito prema nulla — l''algoritmo analizza in continuo i dati dell''accelerometro e attiva l''allarme indipendentemente dall''orario.</span></p><p><strong style="background-color: rgb(247, 255, 254);">Quanti falsi allarmi genera il rilevamento cadute?</strong><span style="background-color: rgb(247, 255, 254);">I sistemi base generano 2–5 falsi allarmi a settimana. L''algoritmo eCura Professional e Premium, dopo il periodo di apprendimento iniziale (2–3 settimane), scende a meno di 1 falso allarme ogni 10 giorni grazie alla personalizzazione del profilo motorio.</span></p><p><strong style="background-color: rgb(247, 255, 254);">Si può fare la doccia con il bracciale?</strong><span style="background-color: rgb(247, 255, 254);">Sì. Tutti i dispositivi eCura hanno certificazione IP67 (resistenza all''acqua fino a 1 metro per 30 minuti). Il bagno è la zona a rischio cadute più alta, quindi è fondamentale che il dispositivo sia indossato anche durante la doccia.</span></p><p><strong style="background-color: rgb(247, 255, 254);">Il bracciale funziona anche fuori casa?</strong><span style="background-color: rgb(247, 255, 254);">Sì. Il GPS outdoor è attivo ovunque ci sia copertura cellulare. I familiari ricevono la posizione in tempo reale sull''app. La localizzazione indoor (Wi-Fi + BLE) funziona solo all''interno dell''abitazione configurata con appositi beacon (opzionali).</span></p>', '<h2>Domande frequenti sui bracciali anti-caduta</h2>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Cos''è un bracciale cadute per anziani?</strong>
  <p style="margin:8px 0 0">È un dispositivo indossabile con sensori di movimento e pulsante SOS che segnala automaticamente le cadute a familiari e/o Centrale Operativa, con la posizione GPS. È la componente indossabile di un servizio di teleassistenza per anziani.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Il bracciale rileva le cadute anche di notte?</strong>
  <p style="margin:8px 0 0">Sì. Il rilevamento automatico è attivo 24 ore su 24, 7 giorni su 7. Non richiede che l''assistito prema nulla: l''algoritmo analizza in continuo i dati dell''accelerometro e attiva l''allarme indipendentemente dall''orario.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Quanti falsi allarmi genera il rilevamento cadute?</strong>
  <p style="margin:8px 0 0">Nessun sistema di rilevamento cadute è perfetto al 100%: può capitare un falso allarme, ad esempio con movimenti bruschi. Con eCura l''algoritmo impara il profilo motorio dell''utente nelle prime settimane; in caso di falso allarme l''operatore della Centrale (piani AVANZATO) chiama, verifica e chiude l''intervento, senza penali.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Si può fare la doccia con il bracciale?</strong>
  <p style="margin:8px 0 0">Sì. I dispositivi eCura hanno certificazione IP67 (resistenza all''acqua fino a 1 metro per 30 minuti). Il bagno è la zona a rischio cadute più alta, quindi è importante che il dispositivo sia indossato anche durante la doccia.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Il bracciale funziona anche fuori casa?</strong>
  <p style="margin:8px 0 0">Sì. Il GPS outdoor è attivo ovunque ci sia copertura cellulare e i familiari ricevono la posizione in tempo reale sull''app. La localizzazione indoor (Wi-Fi + BLE) funziona solo all''interno dell''abitazione configurata con appositi beacon (opzionali).</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Un bracciale cadute è un dispositivo medico?</strong>
  <p style="margin:8px 0 0">Solo se il prodotto è certificato ai sensi del Regolamento (UE) 2017/745 (MDR) e registrato nella Banca dati dei dispositivi medici del Ministero della Salute. Il servizio eCura si avvale di un dispositivo medico certificato Classe IIA (BD/RDM 2853300), verificabile sul sito del Ministero.</p>
</div>

<p class="fonti" style="font-size:.85rem;color:#555;margin:20px 0"><strong>Fonti e riferimenti:</strong> <a href="https://www.who.int/news-room/fact-sheets/detail/falls" rel="noopener" target="_blank">OMS — Falls (scheda informativa)</a> · <a href="https://eur-lex.europa.eu/eli/reg/2017/745/oj" rel="noopener" target="_blank">Regolamento (UE) 2017/745 (MDR)</a> · <a href="https://www.salute.gov.it/portale/dispositivi/homeBancaDatiDispositivi.jsp" rel="noopener" target="_blank">Ministero della Salute — Banca dati dispositivi medici</a></p>'), date_modified = '2026-10-28', updated_at = datetime('now') WHERE slug = 'guida-bracciale-cadute-anziani-2026' AND instr(content, '<h2>Domande frequenti sui bracciali anti-caduta</h2><p><strong style="background-color: rgb(247, 255, 254);">Il bracciale rileva le cadute anche di notte?</strong><span style="background-color: rgb(247, 255, 254);">Sì. Il rilevamento automatico è attivo 24 ore su 24, 7 giorni su 7. Non richiede che l''assistito prema nulla — l''algoritmo analizza in continuo i dati dell''accelerometro e attiva l''allarme indipendentemente dall''orario.</span></p><p><strong style="background-color: rgb(247, 255, 254);">Quanti falsi allarmi genera il rilevamento cadute?</strong><span style="background-color: rgb(247, 255, 254);">I sistemi base generano 2–5 falsi allarmi a settimana. L''algoritmo eCura Professional e Premium, dopo il periodo di apprendimento iniziale (2–3 settimane), scende a meno di 1 falso allarme ogni 10 giorni grazie alla personalizzazione del profilo motorio.</span></p><p><strong style="background-color: rgb(247, 255, 254);">Si può fare la doccia con il bracciale?</strong><span style="background-color: rgb(247, 255, 254);">Sì. Tutti i dispositivi eCura hanno certificazione IP67 (resistenza all''acqua fino a 1 metro per 30 minuti). Il bagno è la zona a rischio cadute più alta, quindi è fondamentale che il dispositivo sia indossato anche durante la doccia.</span></p><p><strong style="background-color: rgb(247, 255, 254);">Il bracciale funziona anche fuori casa?</strong><span style="background-color: rgb(247, 255, 254);">Sì. Il GPS outdoor è attivo ovunque ci sia copertura cellulare. I familiari ricevono la posizione in tempo reale sull''app. La localizzazione indoor (Wi-Fi + BLE) funziona solo all''interno dell''abitazione configurata con appositi beacon (opzionali).</span></p>') > 0;
UPDATE blog_articles SET content = replace(content, 'con una sensibilità superiore al 95%.', ''), date_modified = '2026-10-28', updated_at = datetime('now') WHERE slug = 'guida-bracciale-cadute-anziani-2026' AND instr(content, 'con una sensibilità superiore al 95%.') > 0;
UPDATE blog_articles SET content = replace(content, 'L''algoritmo eCura è stato addestrato su oltre 14.000 cadute reali documentate, ', 'L''algoritmo eCura è stato addestrato su oltre 14.000 cadute reali documentate.'), date_modified = '2026-10-28', updated_at = datetime('now') WHERE slug = 'guida-bracciale-cadute-anziani-2026' AND instr(content, 'L''algoritmo eCura è stato addestrato su oltre 14.000 cadute reali documentate, ') > 0;
UPDATE blog_articles SET content = replace(content, 'con segnalazione degli incidenti all''ISS', 'con segnalazione degli incidenti alle autorità competenti'), date_modified = '2026-10-28', updated_at = datetime('now') WHERE slug = 'guida-bracciale-cadute-anziani-2026' AND instr(content, 'con segnalazione degli incidenti all''ISS') > 0;
UPDATE blog_articles SET content = replace(content, 'eCura Family, Professional e Premium sono tutti e tre certificati.', 'I tre servizi eCura (Family, Professional, Premium) si avvalgono di un dispositivo medico certificato Classe IIA.'), date_modified = '2026-10-28', updated_at = datetime('now') WHERE slug = 'guida-bracciale-cadute-anziani-2026' AND instr(content, 'eCura Family, Professional e Premium sono tutti e tre certificati.') > 0;
UPDATE blog_articles SET content = replace(content, '<p><strong>Approfondimenti correlati:</strong>', '<h2>Domande frequenti</h2>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Cosa fa la centrale operativa H24 della teleassistenza per anziani?</strong>
  <p style="margin:8px 0 0">Riceve l''allarme (caduta rilevata o SOS), apre un canale vivavoce con l''anziano, vede il profilo dell''assistito, valuta la situazione e, secondo il protocollo concordato con la famiglia, chiama i contatti di emergenza o i servizi di soccorso locali.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>La Centrale Operativa H24 è inclusa in tutti i piani eCura?</strong>
  <p style="margin:8px 0 0">La Centrale Operativa H24 è inclusa nei piani AVANZATO (Family, Professional, Premium). Nei piani BASE l''allarme raggiunge i familiari tramite l''app.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Cosa succede se il bracciale rileva un falso allarme?</strong>
  <p style="margin:8px 0 0">L''operatore chiama l''anziano, verifica che stia bene e chiude l''intervento con registrazione. Non ci sono penali o limitazioni per i falsi allarmi.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Cosa succede se l''anziano non risponde alla centrale?</strong>
  <p style="margin:8px 0 0">Si attiva il protocollo di emergenza: la centrale chiama in sequenza i contatti familiari e, in assenza di risposta, provvede a chiamare i servizi di soccorso locali; i familiari ricevono notifica con la posizione GPS.</p>
</div>

<p><strong>Approfondimenti correlati:</strong>'), date_modified = '2026-10-28', updated_at = datetime('now') WHERE slug = 'centrale-operativa-h24-teleassistenza' AND instr(content, '<p><strong>Approfondimenti correlati:</strong>') > 0 AND instr(content, '<h2>Domande frequenti</h2>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Cosa fa la centrale operativa H24 della teleassistenza per anziani?</strong>
  <p style="margin:8px 0 0">Riceve l''allarme (caduta rilevata o SOS), apre un canale vivavoce con l''anziano, vede il profilo dell''assistito, valuta la situazione e, secondo il protocollo concordato con la famiglia, chiama i contatti di emergenza o i servizi di soccorso locali.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>La Centrale Operativa H24 è inclusa in tutti i piani eCura?</strong>
  <p style="margin:8px 0 0">La Centrale Operativa H24 è inclusa nei piani AVANZATO (Family, Professional, Premium). Nei piani BASE l''allarme raggiunge i familiari tramite l''app.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Cosa succede se il bracciale rileva un falso allarme?</strong>
  <p style="margin:8px 0 0">L''operatore chiama l''anziano, verifica che stia bene e chiude l''intervento con registrazione. Non ci sono penali o limitazioni per i falsi allarmi.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Cosa succede se l''anziano non risponde alla centrale?</strong>
  <p style="margin:8px 0 0">Si attiva il protocollo di emergenza: la centrale chiama in sequenza i contatti familiari e, in assenza di risposta, provvede a chiamare i servizi di soccorso locali; i familiari ricevono notifica con la posizione GPS.</p>
</div>

<p><strong>Approfondimenti correlati:</strong>') = 0;
UPDATE blog_articles SET content = replace(content, '<p><strong>Approfondimenti correlati:</strong>', '<h2>Domande frequenti</h2>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Cosa significa dispositivo medico Classe IIA?</strong>
  <p style="margin:8px 0 0">Il Regolamento (UE) 2017/745 (MDR) classifica i dispositivi medici in base al rischio; la Classe IIA è la classe a rischio medio-basso e richiede la valutazione di un Organismo Notificato indipendente, un sistema di qualità ISO 13485 e la sorveglianza post-market.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Come verifico che un bracciale per anziani sia un dispositivo medico certificato?</strong>
  <p style="margin:8px 0 0">Cerca il numero di registrazione nella Banca dati dei dispositivi medici del Ministero della Salute. Il dispositivo di cui si avvale il servizio eCura è registrato con il numero BD/RDM 2853300.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>La certificazione Classe IIA rende il servizio detraibile?</strong>
  <p style="margin:8px 0 0">Per il servizio eCura è prevista la detrazione IRPEF del 19% come spesa sanitaria (art. 15, comma 1, lett. c del TUIR, con franchigia di €129,11). Per la tua situazione specifica consulta un CAF o un commercialista.</p>
</div>

<p class="fonti" style="font-size:.85rem;color:#555;margin:20px 0"><strong>Fonti e riferimenti:</strong> <a href="https://eur-lex.europa.eu/eli/reg/2017/745/oj" rel="noopener" target="_blank">Regolamento (UE) 2017/745 (MDR)</a> · <a href="https://www.salute.gov.it/portale/dispositivi/homeBancaDatiDispositivi.jsp" rel="noopener" target="_blank">Ministero della Salute — Banca dati dispositivi medici</a> · <a href="https://www.agenziaentrate.gov.it/" rel="noopener" target="_blank">Agenzia delle Entrate</a></p>

<p><strong>Approfondimenti correlati:</strong>'), date_modified = '2026-10-28', updated_at = datetime('now') WHERE slug = 'dispositivo-medico-classe-iia-anziani' AND instr(content, '<p><strong>Approfondimenti correlati:</strong>') > 0 AND instr(content, '<h2>Domande frequenti</h2>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Cosa significa dispositivo medico Classe IIA?</strong>
  <p style="margin:8px 0 0">Il Regolamento (UE) 2017/745 (MDR) classifica i dispositivi medici in base al rischio; la Classe IIA è la classe a rischio medio-basso e richiede la valutazione di un Organismo Notificato indipendente, un sistema di qualità ISO 13485 e la sorveglianza post-market.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Come verifico che un bracciale per anziani sia un dispositivo medico certificato?</strong>
  <p style="margin:8px 0 0">Cerca il numero di registrazione nella Banca dati dei dispositivi medici del Ministero della Salute. Il dispositivo di cui si avvale il servizio eCura è registrato con il numero BD/RDM 2853300.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>La certificazione Classe IIA rende il servizio detraibile?</strong>
  <p style="margin:8px 0 0">Per il servizio eCura è prevista la detrazione IRPEF del 19% come spesa sanitaria (art. 15, comma 1, lett. c del TUIR, con franchigia di €129,11). Per la tua situazione specifica consulta un CAF o un commercialista.</p>
</div>

<p class="fonti" style="font-size:.85rem;color:#555;margin:20px 0"><strong>Fonti e riferimenti:</strong> <a href="https://eur-lex.europa.eu/eli/reg/2017/745/oj" rel="noopener" target="_blank">Regolamento (UE) 2017/745 (MDR)</a> · <a href="https://www.salute.gov.it/portale/dispositivi/homeBancaDatiDispositivi.jsp" rel="noopener" target="_blank">Ministero della Salute — Banca dati dispositivi medici</a> · <a href="https://www.agenziaentrate.gov.it/" rel="noopener" target="_blank">Agenzia delle Entrate</a></p>

<p><strong>Approfondimenti correlati:</strong>') = 0;
UPDATE blog_articles SET content = replace(content, '<p><strong>Approfondimenti correlati:</strong>', '<h2>Domande frequenti</h2>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Teleassistenza per anziani o badante: quale conviene?</strong>
  <p style="margin:8px 0 0">Dipende dall''autonomia dell''assistito: la teleassistenza è indicata per anziani ancora autonomi a rischio cadute o per le ore senza caregiver; la badante resta necessaria se serve assistenza fisica continuativa. Per molte famiglie la soluzione migliore è combinarle.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Quanto costa una badante rispetto alla teleassistenza?</strong>
  <p style="margin:8px 0 0">Una badante convivente costa tra 1.700 e 2.200 euro al mese (20.400–26.400 euro/anno) secondo le stime dell''articolo; i servizi eCura costano da €390 a €990 all''anno.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>La teleassistenza può sostituire la badante?</strong>
  <p style="margin:8px 0 0">No, se l''assistito non è autosufficiente: eCura non offre assistenza fisica, igiene, pasti o compagnia. È invece un complemento che garantisce sicurezza H24 nelle ore senza assistenza.</p>
</div>

<p><strong>Approfondimenti correlati:</strong>'), date_modified = '2026-10-28', updated_at = datetime('now') WHERE slug = 'badante-vs-teleassistenza-costi-2026' AND instr(content, '<p><strong>Approfondimenti correlati:</strong>') > 0 AND instr(content, '<h2>Domande frequenti</h2>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Teleassistenza per anziani o badante: quale conviene?</strong>
  <p style="margin:8px 0 0">Dipende dall''autonomia dell''assistito: la teleassistenza è indicata per anziani ancora autonomi a rischio cadute o per le ore senza caregiver; la badante resta necessaria se serve assistenza fisica continuativa. Per molte famiglie la soluzione migliore è combinarle.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Quanto costa una badante rispetto alla teleassistenza?</strong>
  <p style="margin:8px 0 0">Una badante convivente costa tra 1.700 e 2.200 euro al mese (20.400–26.400 euro/anno) secondo le stime dell''articolo; i servizi eCura costano da €390 a €990 all''anno.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>La teleassistenza può sostituire la badante?</strong>
  <p style="margin:8px 0 0">No, se l''assistito non è autosufficiente: eCura non offre assistenza fisica, igiene, pasti o compagnia. È invece un complemento che garantisce sicurezza H24 nelle ore senza assistenza.</p>
</div>

<p><strong>Approfondimenti correlati:</strong>') = 0;
UPDATE blog_articles SET content = replace(content, '<p><strong>Approfondimenti correlati:</strong>', '<h2>Domande frequenti</h2>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Come proteggere un anziano che vive da solo?</strong>
  <p style="margin:8px 0 0">Con un sistema a strati: prevenzione ambientale in casa, un bracciale con rilevamento cadute automatico e Centrale Operativa H24 per intervenire anche se l''anziano non può chiedere aiuto, e l''app per il monitoraggio dei familiari.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Le telecamere bastano per controllare un anziano solo?</strong>
  <p style="margin:8px 0 0">No: registrano ma non intervengono, riducono la privacy, non coprono il bagno e non funzionano fuori casa.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Bracciale cadute o sensori di movimento?</strong>
  <p style="margin:8px 0 0">I sensori rilevano solo l''assenza prolungata di movimento e generano molti falsi allarmi; il bracciale con rilevamento cadute e GPS segnala l''evento e la posizione anche fuori casa. I sensori sono un buon complemento, non un sostituto.</p>
</div>

<p><strong>Approfondimenti correlati:</strong>'), date_modified = '2026-10-28', updated_at = datetime('now') WHERE slug = 'anziano-solo-casa-soluzioni-sicurezza' AND instr(content, '<p><strong>Approfondimenti correlati:</strong>') > 0 AND instr(content, '<h2>Domande frequenti</h2>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Come proteggere un anziano che vive da solo?</strong>
  <p style="margin:8px 0 0">Con un sistema a strati: prevenzione ambientale in casa, un bracciale con rilevamento cadute automatico e Centrale Operativa H24 per intervenire anche se l''anziano non può chiedere aiuto, e l''app per il monitoraggio dei familiari.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Le telecamere bastano per controllare un anziano solo?</strong>
  <p style="margin:8px 0 0">No: registrano ma non intervengono, riducono la privacy, non coprono il bagno e non funzionano fuori casa.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Bracciale cadute o sensori di movimento?</strong>
  <p style="margin:8px 0 0">I sensori rilevano solo l''assenza prolungata di movimento e generano molti falsi allarmi; il bracciale con rilevamento cadute e GPS segnala l''evento e la posizione anche fuori casa. I sensori sono un buon complemento, non un sostituto.</p>
</div>

<p><strong>Approfondimenti correlati:</strong>') = 0;
UPDATE blog_articles SET content = replace(content, '<p><strong>Approfondimenti correlati:</strong>', '<h2>Domande frequenti</h2>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Quanti anziani cadono ogni anno?</strong>
  <p style="margin:8px 0 0">Circa il 28–30% degli anziani over 65 cade almeno una volta l''anno e tra gli over 80 la quota può superare il 40% (dati ISS e Ministero della Salute).</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Dove cadono più spesso gli anziani in casa?</strong>
  <p style="margin:8px 0 0">Le zone a maggior rischio sono il bagno, le scale interne, la cucina, la camera da letto e il soggiorno.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Come si previene una caduta in casa?</strong>
  <p style="margin:8px 0 0">Adattando la casa (maniglioni, tappetini antiscivolo, luce notturna), con attività fisica di equilibrio e forza, revisione dei farmaci con il medico e controllo della vista.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Un bracciale cadute previene le cadute?</strong>
  <p style="margin:8px 0 0">No: non evita la caduta, ma segnala l''evento in automatico a familiari e Centrale Operativa riducendo il tempo senza soccorso. Approfondimento: <a href="/blog/guida-bracciale-cadute-anziani-2026/">guida ai bracciali cadute anziani</a>.</p>
</div>

<p class="fonti" style="font-size:.85rem;color:#555;margin:20px 0"><strong>Fonti e riferimenti:</strong> <a href="https://www.who.int/news-room/fact-sheets/detail/falls" rel="noopener" target="_blank">OMS — Falls (scheda informativa)</a> · <a href="https://www.epicentro.iss.it/passi-argento/" rel="noopener" target="_blank">ISS — PASSI d''Argento</a></p>

<p><strong>Approfondimenti correlati:</strong>'), date_modified = '2026-10-28', updated_at = datetime('now') WHERE slug = 'cadute-casa-anziani-statistiche-prevenzione' AND instr(content, '<p><strong>Approfondimenti correlati:</strong>') > 0 AND instr(content, '<h2>Domande frequenti</h2>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Quanti anziani cadono ogni anno?</strong>
  <p style="margin:8px 0 0">Circa il 28–30% degli anziani over 65 cade almeno una volta l''anno e tra gli over 80 la quota può superare il 40% (dati ISS e Ministero della Salute).</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Dove cadono più spesso gli anziani in casa?</strong>
  <p style="margin:8px 0 0">Le zone a maggior rischio sono il bagno, le scale interne, la cucina, la camera da letto e il soggiorno.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Come si previene una caduta in casa?</strong>
  <p style="margin:8px 0 0">Adattando la casa (maniglioni, tappetini antiscivolo, luce notturna), con attività fisica di equilibrio e forza, revisione dei farmaci con il medico e controllo della vista.</p>
</div>

<div class="faq-item" style="border-left:3px solid #068D86;padding:12px 16px;margin:16px 0;background:#f7fffe;border-radius:0 8px 8px 0">
  <strong>Un bracciale cadute previene le cadute?</strong>
  <p style="margin:8px 0 0">No: non evita la caduta, ma segnala l''evento in automatico a familiari e Centrale Operativa riducendo il tempo senza soccorso. Approfondimento: <a href="/blog/guida-bracciale-cadute-anziani-2026/">guida ai bracciali cadute anziani</a>.</p>
</div>

<p class="fonti" style="font-size:.85rem;color:#555;margin:20px 0"><strong>Fonti e riferimenti:</strong> <a href="https://www.who.int/news-room/fact-sheets/detail/falls" rel="noopener" target="_blank">OMS — Falls (scheda informativa)</a> · <a href="https://www.epicentro.iss.it/passi-argento/" rel="noopener" target="_blank">ISS — PASSI d''Argento</a></p>

<p><strong>Approfondimenti correlati:</strong>') = 0;
