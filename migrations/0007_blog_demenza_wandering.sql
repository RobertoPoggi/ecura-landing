-- Migration 0007: articolo blog — Anziano con demenza che esce di casa da solo
-- Registra l'articolo in D1 (functions/blog/[slug].js legge SOLO da D1).

INSERT OR IGNORE INTO blog_articles (
  slug,
  title,
  description,
  category,
  tag_color,
  author,
  date_published,
  date_modified,
  read_time,
  hero_image,
  hero_image_alt,
  summary,
  content,
  related_1_slug,
  related_1_title,
  related_1_excerpt,
  related_1_tag,
  related_2_slug,
  related_2_title,
  related_2_excerpt,
  related_2_tag,
  related_3_slug,
  related_3_title,
  related_3_excerpt,
  related_3_tag,
  status
) VALUES (
  'demenza-wandering-anziano-esce-di-casa',
  'Anziano con demenza che esce di casa da solo',
  'Il wandering nell''anziano con demenza: cause, segnali premonitori, strategie per la casa e come GPS e geofencing permettono di intervenire in pochi minuti.',
  'Sicurezza',
  '#068D86',
  'Redazione eCura',
  '2026-10-23',
  '2026-10-23',
  '9 min lettura',
  'https://www.ecura.it/img/blog/demenza-wandering-anziano.jpg',
  'Anziana elegante al polso con il dispositivo eCura, sulla porta di casa',
  'Il vagabondaggio ( wandering ) è uno dei comportamenti più comuni e temuti nelle persone con demenza: l''anziano esce di casa da solo, senza meta, e spesso non ricorda come tornare. Per le famiglie è la paura più grande, perché alla caduta si somma il rischio di perdere davvero la persona.',
  '<div class="img-caption hero-caption">Un momento normale della giornata: uscire da casa è più sicuro quando l''app avvisa la famiglia se qualcosa va storto. · <em>Immagine generata con IA</em></div>
<div class="sintesi">
<div class="sintesi-title">In sintesi</div>
<p>Il vagabondaggio (<em>wandering</em>) è uno dei comportamenti più comuni e temuti nelle persone con demenza: l''anziano esce di casa da solo, senza meta, e spesso non ricorda come tornare. Per le famiglie è la paura più grande, perché alla caduta si somma il rischio di perdere davvero la persona. Questo articolo spiega perché succede, come ridurre i rischi in casa e come la tecnologia (GPS, geofencing e allarmi automatici) permette di intervenire in minuti invece che in ore.</p>
</div>
<div class="callout"><strong>⚡ Risposta rapida:</strong> il wandering è un comportamento della demenza, non una scelta: l''anziano esce di casa senza meta e può perdersi o cadere. Le misure chiave sono routine stabile, riduzione dei "grilletti" alla porta, un piano ricerche pronto e un bracciale con <a href="/blog/gps-anziani-indoor-come-funziona/">GPS e geofencing</a> che avvisa la famiglia appena il genitore esce dalla zona sicura: così si interviene in minuti, invece che in ore.</div>

<div class="stats">
<div class="stat"><b>1,43 mln</b><span>persone con demenza vivono oggi in Italia</span></div>
<div class="stat"><b>+54%</b><span>i casi attesi entro il 2050</span></div>
<div class="stat"><b>600.000</b><span>persone con demenza vivono a casa, con la famiglia</span></div>
</div>
<h2>Un problema che riguarda oltre un milione di famiglie italiane</h2>
<p>In Italia vivono oggi <strong>oltre 1.430.000 persone con demenza</strong>, un numero che secondo le stime crescerà di circa il 54% entro il 2050 (<a href="https://www.alzheimer.it/2026/01/28/demenza-in-italia-i-casi-cresceranno-del-54-entro-il-2050/">Fondazione Onda / alzheimer.it</a>). Le stime basate sui residenti ISTAT indicano oltre <strong>1.126.000 casi nella fascia over 65</strong> (<a href="https://www.demenze.it/documenti/schede/report_nazionale.pdf">Report Nazionale Demenze</a>), e circa <strong>600.000 persone con demenza vivono a casa, con la famiglia</strong>, anziché in RSA (<a href="https://www.neodemos.info/2022/02/25/malati-di-alzheimer-e-di-demenze-con-il-covid-picco-di-mortalita/">Istat, EHIS 2019</a>).</p>
<p>Ed è proprio questa quota, la maggioranza, ad affrontare il problema del wandering: un genitore che un giorno apre la porta, esce per "andare al lavoro" come quarant''anni fa, o semplicemente cammina senza direzione, e non sa più tornare indietro.</p>
<h2>Che cos''è il wandering (e perché non è "testardagine")</h2>
<p>Il vagabondaggio è un comportamento legato alla malattia, non a una scelta: la persona con demenza può cercare una casa d''infanzia, un luogo di lavoro, una persona; a volte si sente in obbligo di "andare da qualche parte"; altre volte segue un impulso, senza più il freno dell''orientamento. La letteratura clinica lo classifica tra i comportamenti più comuni della demenza (<a href="https://thesis.unipd.it/retrieve/66bbc371-e40f-4460-b7f6-70e019571517/SCHIAZZANO_Antonio.pdf">fonte</a>).</p>
<p>I segnali che lo preannunciano:</p>
<ul>
<li>il genitore torna a casa più tardi del previsto, o con una spiegazione confusa;</li>
<li>esce "per fare la spesa" a orari inusuali (di notte, con qualsiasi tempo);</li>
<li>si perde in percorsi che conosceva benissimo;</li>
<li>diventa irrequieto, cammina su e giù per casa, tenta la porta quando lasciata incustodita;</li>
<li>dimentica l''indirizzo di casa quando gli viene chiesto.</li>
</ul>
<blockquote>Il momento critico è la transizione: i primi episodi, quando la famiglia ancora non si è organizzata.</blockquote>
<h2>I rischi concreti</h2>
<p>Il wandering non è pericoloso solo perché l''anziano può perdersi:</p>
<ol>
<li><strong>Cadute</strong>: strada sconosciuta, marciapiedi irregolari, fretta e confusione: il rischio caduta, già alto negli anziani (il 28,6% cade almeno una volta l''anno secondo <a href="https://www.epicentro.iss.it/incidenti-domestici/rischi-cadute-anziani">l''ISS</a>), aumenta ulteriormente fuori dal perimetro conosciuto.</li>
<li><strong>Ipotermia e disidratazione</strong>: uscite notturne o invernali senza vestiti adeguati.</li>
<li><strong>Strade e traffico</strong>: una persona confusa non valuta correttamente l''attraversamento.</li>
<li><strong>Le ore che passano prima che qualcuno si accorga</strong>: è il fattore che aggrava tutto il resto. Nella maggior parte dei casi la famiglia scopre l''assenza solo quando è passato molto tempo.</li>
</ol>
<h2>Cosa mettere in pratica subito (strategie per la casa)</h2>
<ul>
<li><strong>Routine stabile</strong>: il vagabondaggio spesso peggiora con l''agitazione. Orari regolari per pasti, sonno e attività riducono gli impulsi di uscita.</li>
<li><strong>Ridurre i "grilletti" della porta</strong>: togliere chiavi visibili, mascherare la porta d''ingresso (specie se il genitore cercava la "sua" casa di prima), usare campanelli sull''apertura.</li>
<li><strong>Oggetti e luoghi di rassicurazione</strong>: foto di famiglia, oggetti familiari, un braccialetto con i recapiti.</li>
<li><strong>Preparare il "piano ricerche"</strong>: una foto recente, un elenco dei luoghi che frequenta (bar, chiesa, parco), i numeri dei vicini da avvisare subito.</li>
<li><strong>Parlare con il medico</strong>: alcuni episodi peggiorano con infezioni, farmaci o dolore; e il medico può orientare sui centri diagnostici per demenza (CDCD) e sui gruppi di supporto per caregiver.</li>
<li><strong>Registrare il genitore su servizi utili</strong>: molti Comuni e il numero verde Alzheimer (Federazione Alzheimer Italia) offrono supporto per i casi di smarrimento.</li>
</ul>
<p>Queste misure riducono il rischio, ma nessuna lo annulla. Il problema strutturale è un altro: <strong>quando l''episodio capita comunque, quanti minuti passano prima che qualcuno se ne accorga?</strong> Ed è qui che la tecnologia cambia l''esito.</p>
<h2>Come la tecnologia trasforma il wandering da emergenza cieca a episodio gestito</h2>
<p>Un bracciale con GPS e geofencing come eCura interviene in tre punti della catena:</p>
<h3>1. Allarme all''uscita dal "perimetro di sicurezza" (geofencing)</h3>
<p>L''app dei familiari permette di definire una <strong>zona sicura</strong>, che può essere l''isolato, il giardino o il quartiere, e riceve una notifica immediata appena il genitore esce da quella zona. Nel caso di un anziano con demenza che vive ancora in autonomia parziale, questo significa sapere che "sta uscendo" <em>mentre esce</em>, non tre ore dopo.</p>
<h3>2. Localizzazione in tempo reale, anche in casa</h3>
<p>Se la notifica arriva mentre siete a lavoro, aprite l''app e vedete la posizione: GPS outdoor e indoor (GPS + Wi-Fi + BLE) significa che il genitore è individuabile anche dentro un centro commerciale, un ospedale o il palazzo di un vicino — i luoghi dove il GPS classico perde la traccia.</p>
<h3>3. Centrale Operativa H24 e SOS automatico</h3>
<p>Se il genitore cade durante l''episodio e non riesce a chiamare, il bracciale rileva la caduta automaticamente (AI addestrata su 14.000 cadute reali) e la Centrale Operativa H24 chiama al polso entro 30 secondi e, se serve, coordina i soccorsi 118 all''indirizzo reale, che grazie al GPS è già noto. I familiari ricevono la notifica push in tempo reale, ovunque si trovino. Con il piano Premium, ogni parametro misurato alimenta le <a href="/blog/analisi-report-servizio-premium/">analisi e report del servizio Premium</a>: andamenti di cuore, ossigeno e sonno da mostrare al medico.</p>
<div class="cta">
<div class="cta-title">🛡️ Bracciale eCura per l''anziano con demenza</div>
<p>Geofencing avanzato · GPS indoor/outdoor · SOS e rilevamento cadute automatico · Centrale H24 · Da €480/anno (Professional, con geofencing avanzato) · Detraibile al 19%</p>
<a href="/#contattaci">Richiedi informazioni gratuite →</a>
</div>
<h2>Il dilemma della privacy: "monitorarlo" senza tradirlo</h2>
<p>È l''obiezione più delicata, e va presa sul serio. Alcuni punti che aiutano le famiglie:</p>
<ul>
<li>il dispositivo <strong>non è una telecamera</strong>: non riprende, non registra ambienti, non esiste "spiare" ma solo localizzare in caso di necessità;</li>
<li>va presentato al genitore con il massimo della trasparenza possibile rispetto alla malattia ("questo orologio dice a Marco dove sei, così se ti perdi ti trova subito");</li>
<li>nei casi in cui la persona non comprende più lo scopo, la scelta spetta al tutore o alla famiglia nel quadro di cura, con il medico informato. La <a href="/blog/teleassistenza-anziani-come-funziona-costi/">guida alla teleassistenza</a> spiega nel dettaglio cosa prevede il servizio;</li>
<li>ricordare il contro-scenario: la persona perduta per una notte a gennaio non è un problema di privacy, è un''emergenza sanitaria.</li>
</ul>
<div class="callout">Per le famiglie che vivono lontane, all''estero o in un''altra città, il geofencing e l''app sono spesso ciò che rende sostenibile la cura a distanza: vedi anche <a href="/blog/caregiver-distanza-genitori-anziani-estero/">come assistere i genitori anziani da fuori</a>.</div>
<h2>Fonti e riferimenti</h2>
<ul>
<li>Fondazione Onda / alzheimer.it — <a href="https://www.alzheimer.it/2026/01/28/demenza-in-italia-i-casi-cresceranno-del-54-entro-il-2050/">Demenza: in Italia i casi cresceranno del 54% entro il 2050</a> (1,43 mln di persone con demenza).</li>
<li>Report Nazionale Demenze — <a href="https://www.demenze.it/documenti/schede/report_nazionale.pdf">stima dei casi over 65</a> basata sui residenti ISTAT al 1° gennaio 2023.</li>
<li>Istat, EHIS 2019 (via Neodemos) — <a href="https://www.neodemos.info/2022/02/25/malati-di-alzheimer-e-di-demenze-con-il-covid-picco-di-mortalita/">circa 600.000 persone con demenza vivono in famiglia</a>.</li>
<li>ISS, Epicentro — <a href="https://www.epicentro.iss.it/incidenti-domestici/rischi-cadute-anziani">Le cadute negli anziani</a> (28,6% cade almeno una volta l''anno).</li>
<li>Letteratura clinica sul vagabondaggio nella demenza — <a href="https://thesis.unipd.it/retrieve/66bbc371-e40f-4460-b7f6-70e019571517/SCHIAZZANO_Antonio.pdf">autonomia funzionale e demenza</a> (Università di Padova).</li>
</ul>
<h2>Domande frequenti</h2>
<details><summary>Mio padre ha una demenza iniziale e vive ancora da solo: è troppo presto per il bracciale?</summary><div><p>È il momento migliore. Il wandering inizia in modo subdolo: installare il dispositivo quando la persona accetta ancora di collaborare evita la transizione brusca dopo il primo episodio serio.</p></div></details>
<details><summary>Il bracciale funziona se il genitore esce dal raggio della zona sicura?</summary><div><p>Sì: il geofencing serve solo ad <em>avvisare</em>. Il GPS continua a tracciare la posizione ovunque, in Italia e nei paesi coperti dalla SIM internazionale inclusa, senza costi aggiuntivi.</p></div></details>
<details><summary>E se il genitore toglie il bracciale?</summary><div><p>Dipende dallo stadio della malattia: nelle fasi iniziali, con la giusta presentazione ("un orologio"), la maggior parte lo indossa regolarmente. Nelle fasi avanzate va valutato con il medico di base o il geriatra come parte del piano di cura.</p></div></details>
<details><summary>Che piano eCura è adatto a una persona con demenza?</summary><div><p>Il <strong>Professional</strong> (da €480/anno) aggiunge il geofencing avanzato al rilevamento cadute; con la Centrale H24 si consiglia il Professional Avanzato (€840/anno). Tutti i piani sono detraibili al 19% come spesa sanitaria.</p></div></details>
<details><summary>Esiste un contributo o un''agevolazione per le persone con demenza?</summary><div><p>Sì: per disabilità riconosciute (es. Legge 104 al 100%) si applica l''IVA al 4% e possono essere richiesti contributi INPS. La <a href="/guida-dispositivi-medici-teleassistenza/">guida ai dispositivi medici e detrazioni</a> spiega i requisiti.</p></div></details>
',
  'gps-anziani-indoor-come-funziona',
  'GPS Anziani Indoor: come funziona il localizzatore in casa',
  'GPS e Wi-Fi RTT/BLE: come il bracciale eCura localizza l''anziano anche in casa.',
  'Tecnologia',
  'caregiver-distanza-genitori-anziani-estero',
  'Caregiver a Distanza: come assistere i genitori anziani dall''estero nel 2026',
  'Vivi all''estero? Monitora i tuoi genitori in Italia in tempo reale con eCura.',
  'Famiglia & Distanza',
  'ai-predittiva-sicurezza-anziani',
  'AI predittiva per la sicurezza degli anziani',
  'Cosa fa (e cosa non fa) l''AI del bracciale, e come protegge la privacy.',
  'Tecnologia',
  'published'
);
