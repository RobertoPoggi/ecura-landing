-- Migration 0018: articolo blog — Teleassistenza in RSA, residenze protette e Centri Alzheimer
-- Registra l'articolo in D1 (functions/blog/[slug].js legge SOLO da D1).

INSERT OR IGNORE INTO blog_articles (
  slug, title, description, category, tag_color, author, date_published, date_modified, read_time,
  hero_image, hero_image_alt, summary, content,
  related_1_slug, related_1_title, related_1_excerpt, related_1_tag,
  related_2_slug, related_2_title, related_2_excerpt, related_2_tag,
  related_3_slug, related_3_title, related_3_excerpt, related_3_tag,
  status
) VALUES (
  'teleassistenza-rsa-residenze-protette-centri-alzheimer',
  'Teleassistenza in RSA e residenze protette',
  'Come funziona la teleassistenza in RSA, residenze protette e Centri Alzheimer: SOS, rilevamento cadute, geofencing, promemoria farmaci e telemonitoraggio.',
  'Strutture residenziali',
  '#068D86',
  'Redazione eCura',
  '2026-10-23',
  '2026-10-23',
  '9 min lettura',
  'https://www.ecura.it/img/blog/rsa-residenze-protette.jpg',
  'Ospite di una residenza protetta con il bracciale di teleassistenza al polso, accompagnata da un operatore socio-sanitario',
  'In una RSA o in una residenza protetta il personale qualificato c''è, ma non basta mai: infermieri e OSS gestiscono decine di ospiti tra round, chiamate e controlli a campione. Il bracciale eCura porta al polso di ogni ospite SOS, rilevamento automatico delle cadute, geofencing del perimetro, promemoria farmaci e telemonitoraggio dei parametri vitali a frequenze configurabili. Non sostituisce infermieri e OSS: li aiuta a intervenire dove serve davvero, con dati invece che con supposizioni. In questo articolo vediamo come funziona in struttura, cosa fa e cosa non fa, e come si introduce con consenso, formazione e integrazione.',
  '<div class="img-caption hero-caption">In residenza protetta il bracciale è al polso dell''ospite anche tra un round e l''altro: SOS, cadute e perimetro sorvegliati in continuo. · <em>Immagine generata con IA</em></div>
<div class="sintesi">
<div class="sintesi-title">In sintesi</div>
<p>In una RSA o in una residenza protetta gli ospiti sono già seguiti da personale qualificato, eppure il personale non è mai abbastanza: infermieri e OSS gestiscono decine di ospiti con round preventivi, telefonate e controlli a campione. Il bracciale di teleassistenza porta al polso di ogni ospite quattro strumenti che lavorano per la struttura: il <strong>SOS</strong> diretto alla Centrale Operativa e al personale, il <strong>rilevamento automatico delle cadute</strong>, il <strong>geofencing</strong> del perimetro e il <strong>telemonitoraggio</strong> dei parametri vitali a frequenze configurabili, con un promemoria farmaci che sostiene l''aderenza terapeutica. Il risultato non è "più tecnologia al posto del personale": è personale che interviene dove serve davvero, con dati invece che con supposizioni.</p>
</div>
<div class="callout"><strong>⚡ Risposta rapida:</strong> nelle strutture residenziali il bracciale eCura funziona come un livello di sicurezza aggiuntivo. L''ospite preme il SOS quando non si sente bene e l''allarme raggiunge la Centrale Operativa H24 e il personale abilitato; una caduta viene rilevata automaticamente (3-5 secondi) anche se l''ospite non può chiamare; l''uscita dal perimetro definito (geofencing) genera un avviso immediato con la posizione; i promemoria farmaci sostengono l''aderenza; il telemonitoraggio raccoglie parametri vitali a frequenze configurabili per ogni ospite. Il personale ottimizza round e controlli e interviene con priorità date dai dati.</div>

<div class="stats">
<div class="stat"><b>12.987</b><span> presidi residenziali in Italia (ISTAT, 1° gennaio 2024)</span></div>
<div class="stat"><b>425.780</b><span> posti letto complessivi, 7,2 ogni 1.000 residenti</span></div>
<div class="stat"><b>~1,2 mln</b><span> persone con demenza over 65 in Italia (ISS, 2025)</span></div>
<div class="stat"><b>25%</b><span> degli ospiti con demenza in RSA accede a un nucleo Alzheimer (survey ISS)</span></div>
</div>

<h2>Le strutture residenziali: un sistema sotto pressione</h2>
<p>Il dato di partenza è un sistema grande e in crescita. Al 1° gennaio 2024 in Italia risultano attivi <strong>12.987 presidi residenziali</strong> con <strong>425.780 posti letto</strong>, pari a 7,2 ogni 1.000 residenti (+4,4% rispetto all''anno precedente). Gli ospiti sono 385.871, il 6% in più dell''anno prima, e tre su quattro hanno più di 65 anni (<a href="https://www.istat.it/comunicato-stampa/le-strutture-residenziali-socio-assistenziali-e-socio-sanitarie-al-1-gennaio-2024/">ISTAT</a>). L''offerta è molto disomogenea: 10,5 posti letto ogni 1.000 residenti nel Nord-Est, 3,4 nel Sud.</p>
<p>Il secondo dato è clinico: le strutture ospitano in grande maggioranza persone fragili. L''ISS stima <strong>circa 1,2 milioni di persone con demenza</strong> nella fascia di età pari o superiore a 65 anni (<a href="https://www.iss.it/-/world-alzheimer-s-day-in-italia-1-2-milioni-di-casi-di-demenza-le-attivita-dell-iss-dall-osservatorio-demenze-agli-studi-dei-meccanismi-della-memoria">ISS, World Alzheimer''s Day 2025</a>). La survey 2022-23 dell''Osservatorio Demenze, condotta su 3.607 RSA e 1.084 Centri Diurni, mostra però che <strong>solo il 25% degli ospiti con demenza in RSA accede a un modulo o nucleo Alzheimer dedicato</strong> (<a href="https://www.quotidianosanita.it/studi-e-analisi/alzheimer-iss-forte-squilibrio-nord-sud-nellaccesso-ai-servizi-sulle-demenze/">Quotidiano Sanità</a>): la maggioranza vive quindi nei reparti ordinari, con comportamenti (il <a href="/blog/demenza-wandering-anziano-esce-di-casa/">wandering</a> per primo) che i protocolli non sempre riescono a sorvegliare in continuo.</p>
<p>Il terzo dato è la risorsa scarsa: in Italia gli infermieri sono <strong>6,5 ogni 1.000 abitanti</strong> (2022), contro una media UE di 8,4, e le iscrizioni a Infermieristica sono quasi dimezzate dal 2012 (<a href="https://www.nurse24.it/infermiere/attualita-infermieri/ocse-2024-italia-numero-infermieri-inferiore-media-ue.html">Nurse24 su OCSE, Health at a Glance: Europe 2024</a>). Con questo punto di partenza, ogni strumento che sottrae minuti ai round e ai controlli a campione e li restituisce alle cure vere cambia l''equilibrio del turno.</p>

<h2>Sicurezza 24 ore su 24: il SOS al polso dell''ospite</h2>
<p>La prima funzione è la più semplice e la più usata: <strong>l''ospite preme il pulsante del bracciale quando non si sente bene</strong>. Non serve raggiungere il citofono, ricordare un numero interno o aspettare che il malore sia visibile a qualcuno. Il segnale arriva agli operatori della <a href="/blog/centrale-operativa-h24-teleassistenza/">Centrale Operativa H24</a>, che chiamano l''ospite al polso, valutano la situazione e attivano l''intervento; in parallelo la notifica può raggiungere gli <strong>infermieri e gli OSS della struttura</strong> abilitati dall''app, con le coordinate GPS dell''ospite. Chi riceve cosa, e in quale ordine, si configura secondo l''organizzazione del reparto: la regola pratica che funziona meglio è far arrivare tutto alla Centrale e girare al personale ciò che richiede la sua presenza.</p>
<p>La seconda funzione copre il caso in cui l''ospite non può chiamare: il <strong>rilevamento automatico delle cadute</strong>, un''AI addestrata su 14.000 eventi reali, riconosce l''evento e allerta in 3-5 secondi. In una struttura le cadute possono avvenire in stanze, bagni e corridoi in momenti in cui nessun operatore è presente; il dispositivo non dipende dal fatto che qualcuno stia passando in quel punto. Per l''ambiente a più alto rischio, il bagno, il dispositivo è certificato <strong>IP67</strong> e si indossa anche in doccia (la <a href="/blog/cadute-in-bagno-anziani-prevenzione/">guida alla sicurezza del bagno</a> vale anche per i reparti).</p>
<p>La differenza tra i due casi è la finestra temporale. Un ospite che si sente male preme un tasto e l''allarme parte subito, senza aspettare il prossimo round. Un ospite che cade può restare a terra finché qualcuno non entra: con il rilevamento automatico la finestra si comprime a pochi secondi. Per la struttura questo si traduce in un dato organizzativo: <strong>meno eventi scoperti</strong> (cadute o malori rimasti a lungo senza soccorso), che sono quelli con le conseguenze sanitarie più gravi e le responsabilità più pesanti.</p>

<h2>Il perimetro protetto: geofencing contro le fughe dalla struttura</h2>
<p>Nei reparti con ospiti cognitivamente fragili, la sfida quotidiana è il rischio che un ospite esca dalla struttura e si allontani. Le conseguenze sono note a ogni direttore: disorientamento, esposizione al traffico, cadute all''esterno, ricerche che coinvolgono forze dell''ordine e personale per ore. Con il <strong>geofencing</strong> si definisce un perimetro virtuale (il giardino recintato, il piano dedicato, il perimetro della villa) e, quando un ospite lo lascia, l''operatore della Centrale e il personale ricevono <strong>un avviso immediato con la posizione</strong>: l''intervento può partire mentre l''ospite è ancora a poche decine di metri dalla porta, non quando qualcuno lo nota assente ore dopo.</p>
<p>Il GPS indoor e outdoor continua a tracciare la posizione oltre il perimetro, così anche nel caso peggiore la ricerca parte da una coordinata e non da un piazzale. Il tema è delicato sul piano etico e va detto con le parole giuste: il geofencing <em>avvisa</em>, non sorveglia con telecamere; il dispositivo non registra immagini né ambienti. La <a href="/blog/gps-anziani-indoor-come-funziona/">guida al GPS indoor</a> descrive come funziona la localizzazione, e la guida al <a href="/blog/demenza-wandering-anziano-esce-di-casa/">wandering</a> affronta anche il dilemma della privacy in famiglia, che in struttura si traduce nel consenso dell''ospite o del tutore.</p>
<p>Per le strutture che ospitano persone con demenza questa funzione è spesso quella che pesa di più nella valutazione. Va però collocata con onestà: è un livello di sorveglianza aggiuntivo per i reparti ordinari, dove vive la maggioranza degli ospiti con demenza, e non sostituisce un nucleo Alzheimer dedicato, che resta un modello di cura con personale e spazi pensati per quel bisogno.</p>

<h2>Promemoria farmaci: l''aderenza terapeutica non è un optional</h2>
<p>La polifarmacia non è un problema solo domestico: in residenza è molto frequente, con ospiti che assumono ogni giorno molti principi attivi tra terapie croniche e integratori. Il rischio si sposta: le dosi sono tracciate, ma gli orari effettivi possono slittare con i turni, gli esami, i trasporti per le terapie. Il <strong>promemoria farmaci al polso</strong> aggiunge un livello che nessun tocco a schermo può dare: l''ospite riceve l''avviso <em>indossato</em>, nel momento esatto, indipendentemente da dove si trovi nel reparto.</p>
<p>Va detto con precisione cosa fa e cosa non fa: il promemoria <strong>avvisa</strong>, non somministra. La somministrazione resta di competenza del personale sanitario, secondo le norme vigenti. Il valore aggiunto è sulla continuità tra i passaggi: l''ospite che riceve il promemoria e lo segnala all''operatore che sta seguendo un altro ospite crea una verifica incrociata che a volte manca. Nella sezione <strong>Farmaci</strong> della cartella digitale la terapia è raccolta in un''unica lista, consultabile da infermieri e medico. La <a href="/blog/polifarmacia-anziani-promemoria-farmaci/">guida alla polifarmacia</a> descrive nel dettaglio le strategie che funzionano.</p>
<p>Per le famiglie che affiancano la struttura, il dato dell''aderenza (dose presa, dose mancata) entra nei <a href="/blog/analisi-report-servizio-premium/">report del servizio Premium</a> e diventa un tema di conversazione concreto con il medico della struttura.</p>

<h2>Telemonitoraggio: frequenze diverse per profili diversi</h2>
<p>Il terzo pilastro è il <strong>telemonitoraggio</strong>: il bracciale misura parametri vitali (frequenza cardiaca con variabilità, saturazione, respirazione, sonno, attività, pressione) e li organizza in analisi leggibili. In struttura la parola chiave è <strong>frequenza</strong>: non esiste un ritmo unico giusto per tutti. Un ospite autonomo e stabile può essere monitorato con parametri di base e controlli periodici; un ospite post-ricovero o con instabilità cardiaca o respiratoria richiede un''osservazione più serrata; un ospite con sospette apnee notturne richiede la finestra notturna dedicata. Le frequenze si configurano per ogni ospite e il personale le modula quando la condizione cambia.</p>
<p>Cosa succede ai dati raccolti: gli <strong>avvisi automatici</strong> trasformano i valori fuori norma in notifiche (desaturazioni notturne, sonno degradato, frequenza a riposo in salita) e, nel piano Premium, le <a href="/blog/analisi-report-servizio-premium/">analisi e i report</a> riassumono andamenti, allarmi e raccomandazioni in linguaggio corrente: per il medico della struttura sono materiale di visita, per la famiglia sono la prova che l''assistenza è presidiata. L''AI di rilevamento lavora al polso, mentre l''<a href="/blog/ai-predittiva-sicurezza-anziani/">AI predittiva</a> (Premium) analizza i pattern che precedono il rischio, sempre con limiti dichiarati e versione beta indicata.</p>
<div class="warn">⚕️ <strong>I dati e i report hanno scopo informativo e non costituiscono una diagnosi.</strong> Un valore anomalo è un indizio, non una diagnosi: la lettura clinica resta al medico. Il sistema rende la lettura possibile, perché i dati sono raccolti e ordinati.</div>

<h2>Risorse assistenziali: fare più con lo stesso personale</h2>
<p>Qui l''articolo entra nel tema che i direttori sanitari mettono per primo: <strong>quanto pesano, in minuti di personale, le attività che il bracciale può alleggerire?</strong> Il calcolo onesto non promette numeri miracolosi, ma su un reparto di trenta ospiti i meccanismi sono identificabili:</p>
<ul>
<li><strong>Round serali e notturni:</strong> il personale fa controlli a campione anche di notte; il telemonitoraggio trasforma parte di quei controlli in dati disponibili a schermo e le anomalie arrivano come notifiche. I round non spariscono, ma si orientano sui profili che il dato segnala.</li>
<li><strong>Chiamate e interfono:</strong> la richiesta d''aiuto via SOS arriva già classificata (SOS premuto, caduta rilevata, allarme sanitario) con la posizione dell''ospite: chi risponde sa cosa sta succedendo prima di arrivare alla stanza.</li>
<li><strong>Ricerche per allontanamenti:</strong> un episodio di allontanamento non rilevato consuma ore tra personale, famiglie e forze dell''ordine; con il geofencing l''evento può chiudersi in pochi minuti. È il risparmio più visibile, perché lo si vede quando accade.</li>
<li><strong>Eventi scoperti:</strong> il rilevamento automatico riduce la quota di cadute scoperte tardi, quelle che trasformano un evento gestibile in un ricovero con prognosi complicata.</li>
<li><strong>Documentazione:</strong> nel servizio Premium analisi e report producono il materiale che il personale altrimenti scrive a mano: andamenti pronti per il medico, non note ricostruite a memoria.</li>
</ul>
<p>Il risultato organizzativo non si esprime in "meno personale": in una fase di carenza strutturale di infermieri si esprime in <strong>più tempo di cura per ogni minuto di personale</strong>. Gli OSS passano meno minuti a cercare e controllare e più minuti ad assistere; gli infermieri rispondono a priorità date dai dati e non all''ordine di arrivo delle chiamate. Sono le stesse risorse, allocate dove producono più sicurezza.</p>

<h2>Implementazione in struttura: consenso, formazione, integrazione</h2>
<p>Le tre cose che determinano il successo di un progetto di teleassistenza in struttura non sono tecnologiche:</p>
<h3>Consenso e privacy</h3>
<p>L''installazione si apre con il consenso dell''ospite (o del tutore legale, quando l''ospite non può esprimerlo), documentato, con un''informativa che spieghi cosa misura il dispositivo, chi accede ai dati e per quale scopo. Il dispositivo <strong>non è una telecamera</strong>: non riprende e non registra ambienti. I dati sono accessibili solo al personale autorizzato e agli operatori della Centrale per l''emergenza, senza alcun uso commerciale. Il GDPR si applica come a casa, con la responsabilità aggiuntiva del titolare del trattamento, che in questo caso è la struttura.</p>
<h3>Formazione del personale</h3>
<p>Infermieri e OSS devono sapere cosa fa il dispositivo, cosa non fa e come rispondere a una notifica. La parte pratica richiede una sessione: cosa significa un allarme di caduta, cosa fare se l''ospite non risponde alla chiamata della Centrale, quando il SOS richiede l''arrivo dell''infermiere e quando basta l''OSS. La parte organizzativa definisce l''escalation: chi copre il turno di notte e chi risponde se il primo non è raggiungibile.</p>
<h3>Integrazione con la cartella</h3>
<p>Il valore del telemonitoraggio cresce se i dati arrivano dove il personale già lavora: la <strong>cartella digitale</strong> del servizio accoglie esami e referti, la sezione Farmaci tiene la terapia aggiornata e i report esportabili si portano alla visita. Il personale non duplica le informazioni: le consulta nello strumento.</p>

<div class="cta">
<div class="cta-title">🛡️ Bracciale eCura per le strutture residenziali</div>
<p>Dispositivo medico certificato Classe IIA · SOS e rilevamento cadute · Centrale Operativa H24 · Geofencing · Promemoria farmaci · Telemonitoraggio a frequenze configurabili</p>
<a href="/#contattaci">Richiedi un preventivo per la tua struttura →</a>
</div>
<p>Sulla certificazione del dispositivo, la guida al <a href="/blog/dispositivo-medico-classe-iia-anziani/">dispositivo medico Classe IIA</a> spiega cosa significa e cosa garantisce.</p>

<h2>Fonti e riferimenti</h2>
<ul>
<li>ISTAT — <a href="https://www.istat.it/comunicato-stampa/le-strutture-residenziali-socio-assistenziali-e-socio-sanitarie-al-1-gennaio-2024/">Le strutture residenziali socio-assistenziali e socio-sanitarie (1° gennaio 2024)</a>: 12.987 presidi, 425.780 posti letto, 7,2 ogni 1.000 residenti, 385.871 ospiti.</li>
<li>ISS — <a href="https://www.iss.it/-/world-alzheimer-s-day-in-italia-1-2-milioni-di-casi-di-demenza-le-attivita-dell-iss-dall-osservatorio-demenze-agli-studi-dei-meccanismi-della-memoria">World Alzheimer''s Day 2025</a>: circa 1,2 milioni di persone con demenza over 65.</li>
<li>Quotidiano Sanità — <a href="https://www.quotidianosanita.it/studi-e-analisi/alzheimer-iss-forte-squilibrio-nord-sud-nellaccesso-ai-servizi-sulle-demenze/">survey ISS 2022-23 su RSA e Centri Diurni</a>: solo il 25% degli ospiti con demenza in RSA accede a un nucleo Alzheimer.</li>
<li>OCSE — <a href="https://www.oecd.org/content/dam/oecd/en/publications/support-materials/2024/11/health-at-a-glance-europe-2024_bb301b77/translated-components/summary-it.pdf">Health at a Glance: Europe 2024, sintesi</a> e <a href="https://www.nurse24.it/infermiere/attualita-infermieri/ocse-2024-italia-numero-infermieri-inferiore-media-ue.html">sintesi dei dati sull''Italia (Nurse24)</a>: 6,5 infermieri ogni 1.000 abitanti contro 8,4 della media UE (2022).</li>
<li>Guida interna — <a href="/come-funziona-bracciale-ecura/">come funziona il servizio: GPS, AI e Centrale H24</a>.</li>
</ul>

<h2>Domande frequenti</h2>
<details><summary>Il bracciale di teleassistenza sostituisce infermieri e OSS in struttura?</summary><div><p>No, e non è il suo scopo. Il dispositivo non somministra cure né decide interventi: rileva le cadute, riceve le richieste d''aiuto, monitora il perimetro e raccoglie parametri vitali. Il suo valore organizzativo è ridurre i round preventivi e i controlli a campione, liberando tempo del personale per le attività che richiedono realmente infermieri e OSS.</p></div></details>
<details><summary>Chi riceve l''allarme SOS quando un ospite non si sente bene?</summary><div><p>Il SOS premuto al polso arriva agli operatori della Centrale Operativa H24, che chiamano l''ospite al polso e coordinano l''intervento; in parallelo la notifica può raggiungere gli infermieri e gli OSS della struttura abilitati dall''app, con le eventuali coordinate GPS. Chi riceve cosa è configurabile secondo l''organizzazione della struttura.</p></div></details>
<details><summary>Come funziona il perimetro virtuale (geofencing) in una residenza?</summary><div><p>Si definisce una zona sicura, per esempio il giardino o il piano dedicato. Quando l''ospite la lascia, l''operatore della Centrale e il personale della struttura ricevono un avviso in tempo reale con la posizione e possono intervenire prima che l''ospite raggiunga la strada. Il GPS continua comunque a tracciare la posizione oltre il perimetro.</p></div></details>
<details><summary>Il promemoria farmaci al polso è sufficiente per la terapia degli ospiti?</summary><div><p>No: il promemoria avvisa l''ospite che è il momento della dose, ma la somministrazione resta di competenza del personale sanitario secondo le norme vigenti. Il valore è sulla continuità: il ricordo al polso sostiene l''aderenza tra i passaggi del personale e la sezione Farmaci tiene la terapia in un''unica lista consultabile da infermieri e medico.</p></div></details>
<details><summary>Quanto costa la teleassistenza per una struttura residenziale?</summary><div><p>I piani individuali partono da €390 l''anno (Family Base), con Professional (da €480) e Premium (da €590) che aggiungono geofencing avanzato e analisi di salute; per le famiglie private il costo è <a href="/blog/bonus-agevolazioni-anziani-2026/">detraibile al 19% come spesa sanitaria</a>. Per le strutture (RSA, residenze protette, case famiglia) si valuta un preventivo dedicato in base al numero di ospiti e alle funzioni attivate.</p></div></details>
',
  'demenza-wandering-anziano-esce-di-casa',
  'Anziano con demenza che esce di casa da solo',
  'Wandering, cause e segnali: come GPS e geofencing permettono di intervenire in pochi minuti.',
  'Sicurezza',
  'centrale-operativa-h24-teleassistenza',
  'Centrale Operativa H24: come funziona davvero',
  'Cosa succede quando scatta un allarme: operatori, tempi e protocolli.',
  'Servizio',
  'analisi-report-servizio-premium',
  'Analisi e report di salute nel servizio Premium',
  'Dashboard, sonno, saturazione e Riepilogo AI: i report da portare al medico.',
  'Servizio Premium',
  'published'
);
