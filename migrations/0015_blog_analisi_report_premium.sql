-- Migration 0015: articolo blog — Analisi e report di salute nel servizio Premium
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
  'analisi-report-servizio-premium',
  'Analisi e report di salute nel servizio Premium',
  'Dashboard, variabilità cardiaca, saturazione notturna, sonno, stress e Riepilogo AI: le analisi e i report del servizio Premium, spiegati in modo semplice.',
  'Servizio Premium',
  '#068D86',
  'Redazione eCura',
  '2026-10-23',
  '2026-10-23',
  '10 min lettura',
  'https://www.ecura.it/img/blog/analisi-report-premium.jpg',
  'Il dispositivo al polso del servizio eCura Premium — un orologio normale che monitora e protegge',
  'Il piano eCura Premium non si limita a rilevare le cadute: trasforma i segnali raccolti dal dispositivo al polso in analisi leggibili e report esportabili : dashboard dei parametri vitali, variabilità cardiaca, saturazione giorno e notte, sonno con le sue fasi, indice di stress, Riepilogo AI e cartella medica digitale. In questo articolo passiamo in rassegna ogni schermata del servizio, spiegando in parole semplici cosa significa ogni numero, a quali domande risponde e come portare i dati al medico senza imbarazzo né gergo.',
  '<div class="img-caption hero-caption">Il dispositivo del servizio Premium: un orologio normale al polso, che misura e protegge mentre la vita continua come sempre. · <em>Immagine generata con IA</em></div>
<div class="sintesi">
<div class="sintesi-title">In sintesi</div>
<p>Il piano <strong>eCura Premium</strong> non si limita a rilevare le cadute: trasforma i segnali raccolti dal dispositivo al polso in <strong>analisi leggibili e report esportabili</strong>: dashboard dei parametri vitali, variabilità cardiaca, saturazione giorno e notte, sonno con le sue fasi, indice di stress, Riepilogo AI e cartella medica digitale. In questo articolo passiamo in rassegna ogni schermata del servizio, spiegando in parole semplici cosa significa ogni numero, a quali domande risponde e come portare i dati al medico senza imbarazzo né gergo.</p>
</div>
<div class="callout"><strong>⚡ Risposta rapida:</strong> il servizio eCura Premium offre otto aree di analisi (frequenza cardiaca con variabilità, saturazione, respirazione, attività, sonno, pressione, idratazione e Health Insights) più un Riepilogo AI che sintetizza lo stato di salute in linguaggio corrente. Ogni misurazione indica il proprio livello di affidabilità, gli avvisi automatici segnalano i valori fuori norma (come desaturazioni notturne o sonno di bassa qualità), e ogni analisi si esporta in un report da mostrare al medico di base.</div>

<div class="stats">
<div class="stat"><b>8</b><span> aree di analisi: cuore, ossigeno, respirazione, sonno, attività, pressione e altro</span></div>
<div class="stat"><b>3</b><span> livelli di affidabilità indicati per ogni misurazione</span></div>
<div class="stat"><b>1 tocco</b><span> per generare il report di salute da portare al medico</span></div>
</div>
<h2>Da "come stai?" a "come stai davvero": perché i dati cambiano la conversazione</h2>
<p>Chi ha un genitore anziano conosce lo scambio di battute di ogni telefonata: "Sto bene, non ti preoccupare". E va bene così, ma significa che la famiglia agisce quasi sempre <strong>dopo</strong> il problema, quando la caduta è già accaduta o il malessere è evidente.</p>
<p>Le analisi del servizio Premium invertono la sequenza: invece di chiedere <em>come stai?</em>, si guarda <em>cosa dicono i dati di questa settimana</em>. La madre che "sta bene" ma da cinque notti dorme quattro ore con dieci risvegli; il padre che non nota di aver passato trenta minuti notturni con l''ossigeno sotto soglia. Non è pignoleria: è <strong>informazione clinica utile</strong>, e apre una conversazione diversa con il medico, che non parte più da "come sta?" ma da "guardi questo andamento". E se il genitore resiste all''idea del dispositivo, abbiamo dedicato una guida alle <a href="/blog/convincere-genitore-anziano-bracciale/">strategie per convincerlo senza conflitto</a>.</p>
<blockquote>Il valore non sta nel singolo numero, sta nell''andamento: il sonno che peggiora da due settimane, la saturazione notturna che scivola sotto il 90%, la frequenza a riposo che si alza piano. Le analisi servono esattamente a questo: rendere visibile ciò che la distanza nasconde.</blockquote>
<h2>La dashboard: lo stato della persona in un colpo d''occhio</h2>
<p>Il primo schermo del servizio è pensato per la domanda che la famiglia si fa ogni mattina: <strong>sta bene, adesso?</strong></p>
<ul>
<li><strong>Parametri vitali di sintesi</strong>: frequenza cardiaca media e saturazione media, ognuna con la propria finestra di normalità indicata accanto al valore;</li>
<li><strong>ultima posizione su mappa</strong>: l''indirizzo reale dell''ultima lettura, utile per capire "è a casa? è uscita?" senza telefonare. Per l''anziano che tende a uscire da solo, poi, la stessa geolocalizzazione è la base del geofencing (vedi <a href="/blog/demenza-wandering-anziano-esce-di-casa/">l''anziano con demenza che esce di casa</a>);</li>
<li><strong>un tocco per la cartella</strong>: un pulsante genera il report di salute da portare al medico, l''altro carica nella cartella digitale un documento come gli esami del sangue.</li>
</ul>
<p class="src"><em>Esempio di dashboard:</em> frequenza cardiaca media 68,3 battiti/min (finestra 50-100), saturazione media 89,7% SpO2, ultima posizione "un indirizzo nel comune di residenza del genitore".</p>
<h2>Frequenza cardiaca e variabilità (HRV): i due numeri che raccontano il cuore</h2>
<h3>La frequenza cardiaca</h3>
<p>Il valore medio e quello a riposo sono la base: la frequenza a riposo di un anziano sano sta tipicamente fra 60 e 80 battiti al minuto. Ciò che interessa al medico non è il picco, ma la <strong>tendenza</strong>: un riposo che da 68 sale stabilmente a 80 in due settimane merita una telefonata al medico, anche se nessun singolo valore è "fuori norma".</p>
<h3>La variabilità della frequenza cardiaca (HRV): SDNN e RMSSD</h3>
<p>Sono le sigle che spaventano di più, e invece il concetto è semplice: il cuore di una persona riposata non batte come un metronomo: <strong>la distanza tra un battito e il successivo varia leggermente</strong>, e quanto varia dice molto sullo stato di recupero del corpo.</p>
<ul>
<li><strong>SDNN</strong>: la variabilità complessiva dell''intervallo tra i battiti, in millisecondi;</li>
<li><strong>RMSSD</strong>: la variabilità "fina" battito per battito. È il parametro che meglio riflette il recupero e l''equilibrio del sistema nervoso autonomo;</li>
<li>tendenze tipiche: variabilità alta e stabile = corpo in equilibrio; variabilità che cala gradualmente = stress, infezione in arrivo o affaticamento.</li>
</ul>
<p>Nell''analisi, ogni misura porta un <strong>livello di affidabilità</strong> (alta, media, bassa): i dati raccolti nella vita vera non sono tutti ugualmente validi, e dirlo è parte della correttezza. Il riquadro di sintesi mostra in un colpo d''occhio minimo, massimo e media del periodo (nell''esempio: media SDNN 60,4 ms, media RMSSD 64 ms).</p>
<h2>La saturazione di notte: il parametro che nessuna famiglia guarda</h2>
<p>La saturazione (SpO2) dice quanto ossigeno c''è nel sangue: il livello corretto sta di norma fra il <strong>95% e il 100%</strong>. Quella che rende questa analisi preziosa è la <strong>separazione tra giorno e notte</strong>: una finestra notturna fissa (nelle analisi: 22:30-05:30) che fotografa ciò che accade mentre l''anziano dorme, e che nessuno dei familiari può osservare.</p>
<p>Il sistema non si limita a mostrare i numeri: <strong>gli avvisi automatici trasformano i dati in frasi</strong>. Due esempi dal report di esempio:</p>
<ul>
<li><em>"Attenzione: nell''ultimo giorno hai trascorso 30 minuti con la saturazione inferiore al 90%"</em>. Un''informazione che da sola giustifica una chiamata al medico;</li>
<li>il <strong>minimo annuale</strong> evidenziato (nel report: 70% SpO2), cioè il valore peggiore dell''anno, che il medico vuole sempre sapere.</li>
</ul>
<p>Desaturazioni ripetute di notte sono il segnale classico di <strong>possibili apnee notturne</strong>, una condizione sottodiagnosticata negli anziani che peggiora sonno, pressione e rischio cardiovascolare. Non è una diagnosi (vedi sotto), ma è esattamente il tipo di indizio che porta a fare l''esame giusto.</p>
<h2>Il sonno: durata, qualità e fasi — il primo indicatore di malessere</h2>
<p>L''analisi del sonno scompone ogni notte in <strong>quattro fasi</strong> (sonno profondo, sonno leggero, REM, risvegli), con il tempo totale e un punteggio di qualità su 100. Se conta così tanto è perché nel sonno si vede prima che altrove il corpo che non sta bene.</p>
<p>Un estratto dalla tabella settimanale del report di esempio rende l''idea:</p>
<ul>
<li>5h 42m di sonno, con 3h 38m di risvegli: qualità non valutabile;</li>
<li>6h 06m con punteggio di qualità <strong>23/100</strong> (evidenziato in rosso);</li>
<li>4h 00m totali, sonno profondo solo 24 minuti, qualità <strong>26/100</strong>.</li>
</ul>
<p>Una notte di sonno pessimo capita a tutti; <strong>una settimana intera sotto i 30/100</strong>, con sonno profondo scarno e risvegli infiniti, è un pattern che merita un parere medico, ed è il tipo di pattern che in una telefonata settimanale nessuno dei due racconterebbe mai.</p>
<p>E i risvegli notturni hanno un seguito concreto: i tragitti al buio verso il bagno sono tra le cadute più frequenti in casa. Qui la guida su <a href="/blog/cadute-in-bagno-anziani-prevenzione/">come rendere il bagno sicuro</a>.</p>
<h2>Health Insights: lo stress e la risposta allo sforzo, in una riga</h2>
<p>È l''area più avanzata del servizio, e la più onesta sul suo stato: alcune funzioni sono dichiaratamente in <strong>versione beta</strong>, e il servizio lo scrive a schermo. Cosa offre:</p>
<ul>
<li><strong>Indice di stress</strong>: calcolato a partire dalla variabilità cardiaca (RMSSD), con una lettura in linguaggio corrente, del tipo "il corpo sembra riposato — alta variabilità cardiaca e polso tranquillo";</li>
<li><strong>polso a riposo vs polso sotto sforzo</strong>, e la <strong>reattività allo sforzo</strong> (la differenza fra i due): dice quanto il cuore "risponde" all''attività; nell''esempio, riposo 69, sotto sforzo 74, reattività +5;</li>
<li><strong>grafico integrato</strong>: frequenza cardiaca, saturazione e respirazione sulla stessa linea temporale, per vedere come si muovono insieme nella giornata del genitore.</li>
</ul>
<h2>Il Riepilogo AI: la sintesi che parla a chi non è medico</h2>
<p>È forse la funzione più utile per le famiglie. A richiesta, il sistema genera un <strong>riepilogo in linguaggio corrente</strong> dello stato della persona, strutturato in tre sezioni:</p>
<ol>
<li><strong>Stato di salute</strong>: chi è la persona assistita, la mobilità, le condizioni note (nel report di esempio: una persona che cammina in autonomia, con un deficit uditivo noto e nessuna patologia cronica registrata);</li>
<li><strong>Allarmi e misurazioni</strong>: cosa è successo nelle ultime 24 ore, fra allarmi non ancora gestiti, assenza di misurazioni e anomalia più rilevante. Un allarme dimenticato non resta sepolto: il riepilogo lo riporta in superficie e lo segnala;</li>
<li><strong>Raccomandazioni</strong>: l''azione concreta suggerita. Nel report di esempio, "contattare immediatamente il referente per verificare lo stato, considerando l''ipoacusia che potrebbe aver impedito la ricezione degli allarmi", con l''ultima coordinata GPS disponibile.</li>
</ol>
<p>Per un figlio che vive a 600 chilometri, questo è il collegamento che manca: non devi interpretare dieci grafici, <strong>leggi tre paragrafi e sai cosa fare</strong>. Approfondimento correlato: <a href="/blog/ai-predittiva-sicurezza-anziani/">l''AI predittiva: cosa fa e cosa non fa</a>.</p>
<h2>Cartella medica e farmaci: il diario completo</h2>
<p>Accanto ai numeri, il servizio mantiene il <strong>contesto clinico</strong>, perché un dato senza contesto vale meno:</p>
<ul>
<li><strong>Cartella medica digitale</strong>: dove caricare esami, referti e documenti. Al momento della visita, medico e caregiver guardano gli stessi file;</li>
<li><strong>sezione Farmaci</strong>: la terapia in un''unica lista, collegata ai promemoria (vedi <a href="/blog/polifarmacia-anziani-promemoria-farmaci/">polifarmacia e promemoria farmaci</a>);</li>
<li><strong>rilevazioni ripetute</strong>: quando il sistema nota lo stesso segnale più volte (nell''esempio: cinque rilevazioni di apnea notturna), lo accumula in un pattern visibile, invece di lasciarlo disperdersi in notifiche singole.</li>
</ul>
<h2>I report: il ponte verso il medico</h2>
<p>Tutte queste analisi convergono nel <strong>report esportabile</strong>, il documento che si porta alla visita (di base o specialistica) e che cambia la qualità della consultazione:</p>
<ul>
<li>si genera <strong>in un tocco dalla dashboard</strong>, per il periodo che interessa (settimana, mese, anno);</li>
<li>contiene andamenti, sintesi e tabelle, non screenshot confusi;</li>
<li>consente al medico di vedere <strong>tendenze tra visite</strong>, che è ciò che i dati isolati di un misuratore non danno;</li>
<li>restituisce dignità alla conversazione: non "papà dice che dorme male", ma "questa è la settimana di sonno di papà, che ne pensa?".</li>
</ul>
<p>Il momento in cui serve di più è il <strong>rientro dopo un ricovero</strong>, quando la terapia cambia e i giorni successivi sono quelli a più alto rischio: un report settimanale post-dimissione è la miglior "carta d''identità clinica" che la famiglia possa portare al controllo. Vedi <a href="/blog/cadute-post-dimissione-ospedale-prevenzione/">prevenire le cadute dopo la dimissione</a>.</p>
<h2>Cosa i report NON sono (e perché è bene dirlo)</h2>
<div class="warn">⚕️ <strong>I dati e i report hanno scopo informativo e non costituiscono una diagnosi medica</strong>, e il servizio lo dichiara esplicitamente su ogni analisi. Tre limiti da tenere a mente: (1) un valore anomalo è un <em>indizio</em>, non una diagnosi: lo valuta il medico; (2) le funzioni predittive sono in versione beta e dichiarano i propri margini; (3) i numeri non sostituiscono mai la persona: il rapporto umano resta la parte del servizio che nessun grafico copre.</div>
<h2>Chi trae il massimo dalle analisi Premium</h2>
<ul class="feat">
<li><span class="tag">Figlio a distanza</span><b>Caregiver che vive in un''altra città o all''estero</b>: la dashboard mattutina e il Riepilogo AI sostituiscono dieci telefonate di controllo con una lettura di trenta secondi. Vedi <a href="/blog/caregiver-distanza-genitori-anziani-estero/">come assistere i genitori da lontano</a>.</li>
<li><span class="tag">Post-ricovero</span><b>Famiglie in convalescenza</b>. Le prime settimane dopo la dimissione sono quelle a più alto rischio: report settimanale al medico, saturazione e sonno sotto osservazione, terapia revisionata con la sezione Farmaci.</li>
<li><span class="tag">Malattie croniche</span><b>Anziani con cuore, pressione o respirazione fragili</b>: gli avvisi automatici su saturazione notturna e frequenza trasformano "sento che qualcosa non va" in un dato da mostrare.</li>
<li><span class="tag">Sonno e apnee</span><b>Chi sospetta apnee notturne</b>: il confronto giorno/notte e le rilevazioni ripetute danno al medico il motivo concreto per prescrivere l''esame giusto.</li>
<li><span class="tag">Idea regalo</span><b>Chi cerca il regalo davvero utile</b>: le analisi Premium come pezzo forte di un pensiero per il genitore che ha tutto, con le <a href="/blog/regalo-genitore-anziano-natale/">12 idee regalo per genitori anziani</a>.</li>
</ul>
<div class="callout">💡 <strong>Sul costo:</strong> il piano Premium parte da €590/anno ed è <a href="/blog/bonus-agevolazioni-anziani-2026/">detraibile al 19% come spesa sanitaria</a>, compatibile con le altre agevolazioni 2026 (IVA 4% per i disabili, contributi INPS e misure del Decreto Anziani mappate nella guida a bonus e agevolazioni).</div>
<div class="cta">
<div class="cta-title">📊 Servizio eCura Premium: la salute in numeri, la serenità in più</div>
<p>Dashboard clinica · 8 aree di analisi · Riepilogo AI · Report esportabili · Dispositivo medico certificato Classe IIA · Da €590/anno · Detraibile al 19%</p>
<a href="/#contattaci">Richiedi informazioni gratuite →</a>
</div>
<h2>Fonti e riferimenti</h2>
<ul>
<li>Report di analisi di esempio del servizio Premium (documento di dimostrazione del servizio, dati di prova).</li>
<li>Guida interna — <a href="/come-funziona-bracciale-ecura/">come funziona il servizio: GPS, AI e Centrale H24</a>.</li>
<li>Guida interna — <a href="/blog/ai-predittiva-sicurezza-anziani/">AI predittiva: cosa fa e cosa non fa</a>.</li>
<li>Contesto epidemiologico — ISS, Epicentro: <a href="https://www.epicentro.iss.it/incidenti-domestici/rischi-cadute-anziani">le cadute negli anziani</a>.</li>
</ul>
<h2>Domande frequenti</h2>
<details><summary>I report sostituiscono le visite mediche?</summary><div><p>No, e non è il loro scopo. I report e le analisi hanno scopo informativo e non costituiscono una diagnosi: sono il materiale che rende le visite più utili, perché il medico vede andamenti e dati obiettivi tra una visita e l''altra invece di partire da zero.</p></div></details>
<details><summary>Cosa significa "livello di affidabilità" su una misurazione?</summary><div><p>Non tutte le misurazioni raccolte nella vita quotidiana hanno la stessa qualità (movimento, posizione del dispositivo, durata della misura). Ogni dato indica se la sua affidabilità è alta, media o bassa: aiuta a capire quali valori guardare con più fiducia.</p></div></details>
<details><summary>Devo capire i grafici per usare il servizio?</summary><div><p>No. Il Riepilogo AI traduce i dati in tre paragrafi in linguaggio corrente (stato di salute, allarmi delle ultime 24 ore, raccomandazioni) e gli avvisi automatici trasformano le anomalie in frasi dirette. I grafici restano a disposizione di chi vuole approfondire.</p></div></details>
<details><summary>Chi può vedere i dati di mio genitore?</summary><div><p>Esclusivamente i familiari e i caregiver collegati all''app e, per la gestione dell''emergenza, gli operatori della Centrale Operativa. I dati servono alla sicurezza, non alla profilazione: nessun uso commerciale.</p></div></details>
<details><summary>Le funzioni predittive sono definitive?</summary><div><p>Alcune (come il modello di previsione del polso) sono dichiaratamente in versione beta: il servizio pubblica insieme al valore anche precisione ed errore medio del modello. È l''approccio che preferiamo: mostrare i limiti, non nasconderli.</p></div></details>
',
  'ai-predittiva-sicurezza-anziani',
  'AI predittiva per la sicurezza degli anziani',
  'Cosa fa (e cosa non fa) l''AI del bracciale, e come protegge la privacy.',
  'Tecnologia',
  'polifarmacia-anziani-promemoria-farmaci',
  'Polifarmacia nell''anziano: rischi e promemoria',
  'Quando 5 farmaci al giorno diventano un rischio e come aiutare la famiglia.',
  'Salute',
  'caregiver-distanza-genitori-anziani-estero',
  'Caregiver a Distanza: come assistere i genitori anziani dall''estero nel 2026',
  'Vivi all''estero? Monitora i tuoi genitori in Italia in tempo reale con eCura.',
  'Famiglia & Distanza',
  'published'
);
