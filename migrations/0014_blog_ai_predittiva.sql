-- Migration 0014: articolo blog — AI predittiva per la sicurezza degli anziani
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
  'ai-predittiva-sicurezza-anziani',
  'AI predittiva per la sicurezza degli anziani',
  'Come l''AI predittiva del bracciale eCura analizza i pattern di movimento per segnalare il rischio prima: cosa fa, cosa non fa e come tutela la privacy.',
  'Tecnologia',
  '#068D86',
  'Redazione eCura',
  '2026-10-23',
  '2026-10-23',
  '7 min lettura',
  'https://www.ecura.it/img/blog/ai-predittiva-sicurezza.jpg',
  'Primo piano del polso con la notifica di caduta rilevata e icona SOS',
  '"Intelligenza artificiale" è diventata la parola di moda, e genera più confusione che fiducia. Questo articolo spiega in modo concreto come funziona l''AI del bracciale eCura: da un lato l''AI di rilevamento cadute , addestrata su 14.000 cadute reali; dall''altro l'' AI predittiva , che analizza i pattern comportamentali per segnalare il rischio prima che accada.',
  '<div class="img-caption hero-caption">Quando l''AI riconosce una caduta, l''allarme parte in 3-5 secondi — anche se l''anziano non può chiamare. · <em>Immagine generata con IA</em></div>
<div class="sintesi">
<div class="sintesi-title">In sintesi</div>
<p>"Intelligenza artificiale" è diventata la parola di moda, e genera più confusione che fiducia. Questo articolo spiega in modo concreto come funziona l''AI del bracciale eCura: da un lato l''AI di <strong>rilevamento cadute</strong>, addestrata su 14.000 cadute reali; dall''altro l''<strong>AI predittiva</strong>, che analizza i pattern comportamentali per segnalare il rischio prima che accada. Lo facciamo con la stessa onestà su quello che <em>non</em> fa: niente telecamere, nessuna predizione infallibile, nessuna sostituzione della persona che assiste.</p>
</div>
<div class="callout"><strong>⚡ Risposta rapida:</strong> l''AI predittiva del bracciale eCura analizza i segnali del dispositivo (movimento, parametri vitali, pattern giornalieri) per distinguere i movimenti normali da una caduta vera entro 3-5 secondi, e per segnalare cambiamenti comportamentali che precedono le situazioni di rischio. Non usa telecamere, non profila l''anziano per fini commerciali, e non sostituisce il giudizio di medici e familiari: è uno strumento che accorcia i tempi, non una sfera di cristallo.</div>

<div class="stats">
<div class="stat"><b>14.000</b><span> cadute reali su cui è stata addestrata l''AI di rilevamento</span></div>
<div class="stat"><b>3-5 sec</b><span> tempo medio di rilevamento e allerta dopo la caduta</span></div>
<div class="stat"><b>60.000</b><span> utenti in Europa usano la tecnologia, in 12 paesi</span></div>
</div>
<h2>Le due AI del bracciale, spiegate senza fumo</h2>
<h3>1. L''AI di rilevamento cadute: riconoscere la caduta vera</h3>
<p>Il problema tecnico è più sottile di quanto sembri: una persona si "abbassa" mille volte al giorno: si piega a raccogliere, si siede, si sdraia, scivola di proposito sul divano. Un sensore ingenuo farebbe falsi allarmi ogni ora (insopportabili, fino a portare la famiglia a disattivare il servizio) o, peggio, non riconoscerebbe la caduta silenziosa di notte.</p>
<p>L''AI di eCura è stata addestrata su <strong>14.000 cadute reali documentate</strong>: impara a distinguere il pattern di una caduta involontaria (l''accelerazione, l''impatto, l''improvvisa immobilità che segue) da tutti i movimenti normali. Il risultato pratico: il rilevamento avviene <strong>entro 3-5 secondi</strong> e senza alcuna azione dell''anziano, che nelle cadute reali spesso <em>non può</em> premere nulla o chiamare.</p>
<h3>2. L''AI predittiva: leggere i pattern che precedono il rischio</h3>
<p>Il passo ulteriore (piano eCura Premium) è l''analisi dei <strong>pattern comportamentali</strong>: l''anziano che di solito alle 8 è già in piedi ma stamattina alle 10 è ancora a letto; l''andamento del sonno che cambia; i parametri vitali che tendono fuori dalla loro finestra abituale. Singolarmente, nessuno di questi segnali è un allarme; combinati, possono indicare un malessere in arrivo: un''infezione che sta partendo, un peggioramento dell''equilibrio, una notte senza sonno che predispone alla caduta del mattino.</p>
<p>In questo caso l''AI non "predice il futuro": <strong>segnala il cambiamento</strong> alla Centrale Operativa e ai familiari, che decidono cosa fare: chiamare, passare a trovare, anticipare la visita. È una differenza da tenere chiara: lo strumento accende il fiammifero, la persona valuta. Per capire dove finiscono questi segnali e come si leggono concretamente, c''è la guida completa alle <a href="/blog/analisi-report-servizio-premium/">analisi e report del servizio Premium</a>.</p>
<h2>Cosa NON fa (e perché è importante dirlo)</h2>
<div class="duo">
<div class="si"><strong>✅ Cosa fa</strong><br/><br/>
<ul>
<li>Rileva le cadute in automatico, in 3-5 secondi, senza azione dell''anziano</li>
<li>Analizza pattern di movimento e parametri vitali con <strong>accuratezza clinica certificata</strong> (dispositivo medico Classe IIA, MDR 2017/745)</li>
<li>Segnala cambiamenti comportamentali significativi a Centrale H24 e familiari</li>
<li>Localizza con GPS multi-tecnologia indoor/outdoor quando serve davvero</li>
</ul>
</div>
<div class="no"><strong>❌ Cosa NON fa</strong><br/><br/>
<ul>
<li>Non usa <strong>telecamere</strong> né registra audio: nessuna "sorveglianza visiva" della casa</li>
<li>Non è infallibile: come ogni sistema, può generare falsi allarmi o (raramente) mancare un caso. La Centrale H24 è il livello umano che copre questi margini</li>
<li>Non sostituisce medico, badante o la visita di un figlio: organizza il tempo dell''aiuto, non lo elimina</li>
<li>Non rivende né profila i dati per pubblicità: i dati servono alla sicurezza, al punto</li>
</ul>
</div>
</div>
<blockquote>La domanda giusta da fare a un fornitore di teleassistenza non è "hai l''AI?" ma "cosa succede quando l''AI sbaglia?". La risposta di eCura: la <a href="/blog/centrale-operativa-h24-teleassistenza/">Centrale Operativa H24</a>, con operatori umani che chiamano, verificano e se necessario attivano i soccorsi.</blockquote>
<h2>Perché la certificazione medica conta più del marketing sull''AI</h2>
<p>Il mercato è pieno di smartwatch con funzioni "di benessere" che si spingono oltre il permesso. La differenza strutturale di eCura è la <strong>certificazione di dispositivo medico Classe IIA</strong> (BD/RDM 2853300, iscritto nella Banca Dati Dispositivi Medici del Ministero della Salute): significa che le misurazioni (frequenza cardiaca, SpO2, pressione) sono soggette a un <strong>controllo normativo con accuratezza clinica dichiarata e verificata</strong>, non a un disclaimer "non per uso diagnostico". Quando un allarme parte, la famiglia deve poter fidarsi del numero che lo ha causato. La <a href="/blog/dispositivo-medico-classe-iia-anziani/">guida alla Classe IIA</a> spiega cosa garantisce esattamente.</p>
<h2>La privacy, presa sul serio</h2>
<p>È la preoccupazione che le famiglie ci esprimono di più, e merita risposte precise:</p>
<ul>
<li><strong>Il dispositivo misura il corpo, non la stanza</strong>: accelerometro, sensori vitali, GPS. Niente fotocamera, niente microfono sempre attivo.</li>
<li><strong>I dati sono accessibili solo a chi deve usarli</strong>: i familiari collegati all''app e, per l''emergenza, gli operatori della Centrale. Non un pubblico generico.</li>
<li><strong>Il GPS si attiva al servizio della localizzazione in emergenza</strong>: non è un registro di ogni movimento da mostrare ai figli "curiosi". L''uso corretto (e quello che raccomandiamo) è trasparente verso l''anziano, come spiegato nell''articolo sul <a href="/blog/demenza-wandering-anziano-esce-di-casa/">wandering</a>.</li>
<li><strong>L''anziano resta al centro</strong>: il dispositivo non chiede nulla: non va configurato da lui, non lo interroga, non lo corregge. È la tecnologia silenziosa, che è anche quella che gli anziani accettano davvero.</li>
</ul>
<div class="cta">
<div class="cta-title">🛡️ eCura Premium: l''AI predittiva, certificata Classe IIA</div>
<p>AI su 14.000 cadute reali · Pattern comportamentali · Parametri vitali certificati · Centrale H24 · Da €590/anno · Detraibile al 19%</p>
<a href="/#contattaci">Richiedi informazioni gratuite →</a>
</div>
<h2>Fonti e riferimenti</h2>
<ul>
<li>Schede ufficiali eCura — <a href="/come-funziona-bracciale-ecura/">come funziona il bracciale: GPS, AI cadute e Centrale H24</a>.</li>
<li>Certificazione — <a href="/blog/dispositivo-medico-classe-iia-anziani/">Dispositivo medico Classe IIA: cosa significa davvero</a>.</li>
<li>Contesto epidemiologico — ISS, Epicentro: <a href="https://www.epicentro.iss.it/incidenti-domestici/rischi-cadute-anziani">le cadute negli anziani</a>.</li>
</ul>
<h2>Domande frequenti</h2>
<details><summary>Come distingue l''AI una vera caduta da un movimento normale?</summary><div><p>È stata addestrata su 14.000 cadute reali documentate: impara la firma fisica di una caduta involontaria (accelerazione brusca, impatto, immobilità improvvisa) e la distingue dai movimenti normali come sedersi, piegarsi o sdraiarsi. Per questo genera pochi falsi allarmi senza perdere le cadute silenziose.</p></div></details>
<details><summary>L''AI predittiva "legge nel futuro" dell''anziano?</summary><div><p>No. Non predice eventi: riconosce cambiamenti nei pattern comportamentali e nei parametri vitali (sonno, movimento, frequenza cardiaca) che spesso precedono un problema, e li segnala a Centrale H24 e familiari. La decisione su cosa fare resta umana.</p></div></details>
<details><summary>C''è una telecamera o un microfono nel bracciale?</summary><div><p>No. Il dispositivo misura il corpo tramite accelerometro e sensori vitali, e usa il GPS per la localizzazione. Non riprende, non registra audio: la privacy della casa resta intatta.</p></div></details>
<details><summary>Cosa succede se l''AI sbaglia — allarme falso o caduta persa?</summary><div><p>Su allarme, la Centrale Operativa H24 chiama l''anziano al polso: se risponde, l''episodio si chiude in una conversazione di trenta secondi. Le cadute perse sono il rischio più grave, e per questo esiste il livello umano H24: è la rete di sicurezza sotto il software.</p></div></details>
<details><summary>La funzione AI è in tutti i piani eCura?</summary><div><p>Il rilevamento cadute automatico con AI (addestrata su 14.000 cadute) è incluso in tutti i piani. L''AI predittiva avanzata, cioè l''analisi dei pattern comportamentali e gli alert personalizzati, è nel piano Premium (da €590/anno), insieme a SpO2 continuo, analisi del sonno e dashboard clinica.</p></div></details>
',
  'centrale-operativa-h24-teleassistenza',
  'Centrale Operativa H24: come funziona il telesoccorso eCura',
  'Cosa succede quando cade l''anziano? Tempi, protocolli, operatori certificati.',
  'Servizio',
  'dispositivo-medico-classe-iia-anziani',
  'Dispositivo Medico Classe IIA: cosa significa davvero',
  'La certificazione MDR 2017/745 non è un marchio: ecco cosa garantisce.',
  'Certificazioni',
  'analisi-report-servizio-premium',
  'Analisi e report di salute nel servizio Premium',
  'Come leggere dashboard, sonno, saturazione e Riepilogo AI.',
  'Servizio Premium',
  'published'
);
