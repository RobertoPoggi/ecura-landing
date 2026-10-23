-- Migration 0010: articolo blog — Bonus e agevolazioni per gli anziani nel 2026
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
  'bonus-agevolazioni-anziani-2026',
  'Bonus e agevolazioni per gli anziani nel 2026',
  'Prestazione Universale, assegno di assistenza, bonus caregiver, detrazione 19% e IVA 4%: le agevolazioni 2026 per gli anziani, con requisiti e fonti.',
  'Fiscale',
  '#068D86',
  'Redazione eCura',
  '2026-10-23',
  '2026-10-23',
  '10 min lettura',
  'https://www.ecura.it/img/blog/bonus-agevolazioni-2026.jpg',
  'Polso di anziano con il dispositivo, sopra documenti fiscali e occhiali',
  'Il 2026 porta con sé un quadro di misure in forte evoluzione per gli anziani non autosufficienti e le loro famiglie: la Prestazione Universale del Decreto Anziani, l'' assegno di assistenza che integra l''indennità di accompagnamento, un bonus caregiver in arrivo, le detrazioni IRPEF per le spese di assistenza e l'' IVA al 4% sui dispositivi medici. In questa guida trovate chi ha diritto a cosa, requisiti, importi e come combinarle con la detraibilità della teleassistenza.',
  '<div class="img-caption hero-caption">La spesa per la teleassistenza è una spesa sanitaria: detraibile al 19% e, per i disabili riconosciuti, con IVA al 4%. · <em>Immagine generata con IA</em></div>
<div class="sintesi">
<div class="sintesi-title">In sintesi</div>
<p>Il 2026 porta con sé un quadro di misure in forte evoluzione per gli anziani non autosufficienti e le loro famiglie: la <strong>Prestazione Universale</strong> del Decreto Anziani, l''<strong>assegno di assistenza</strong> che integra l''indennità di accompagnamento, un <strong>bonus caregiver</strong> in arrivo, le detrazioni IRPEF per le spese di assistenza e l''<strong>IVA al 4%</strong> sui dispositivi medici. In questa guida trovate chi ha diritto a cosa, requisiti, importi e come combinarle con la detraibilità della teleassistenza.</p>
</div>
<div class="callout"><strong>⚡ Risposta rapida:</strong> le principali agevolazioni per gli anziani nel 2026 sono la Prestazione Universale (Decreto Anziani) per i non autosufficienti con bisogno gravissimo; l''assegno di assistenza, che integra l''indennità di accompagnamento fino a 850 € al mese; il bonus caregiver (fino a 400 € al mese, in attesa di approvazione finale); la detrazione IRPEF del 19% sulle spese sanitarie; l''IVA al 4% sui dispositivi medici certificati.</div>
<div class="warn">⚠️ <strong>Nota di completezza:</strong> informazioni aggiornate a ottobre 2026. Molte misure sono state riformate di recente e alcune sono ancora in fase di attuazione: importi, requisiti e finestre di domanda cambiano rapidamente. Verificate sempre le condizioni aggiornate sui canali ufficiali INPS e, per la vostra situazione specifica, con un CAF o un consulente.</div>

<h2>Le misure del Decreto Anziani: Prestazione Universale e assegno di assistenza</h2>
<p>La riforma più rilevante degli ultimi anni per l''assistenza domiciliare è il cosiddetto <strong>Decreto Anziani</strong>, che introduce la <strong>Prestazione Universale</strong>: una prestazione INPS destinata alle <strong>persone anziane non autosufficienti con bisogno assistenziale gravissimo</strong>, pensata per sostenere la domiciliarità e l''autonomia. In pratica, la possibilità di restare a casa invece che entrare in una struttura (<a href="https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.decreto-anziani-prestazione-universale.html">scheda ufficiale INPS</a>).</p>
<p>Sullo stesso impianto si innesta l''<strong>assegno di assistenza per gli anziani</strong>: una misura che integra l''<strong>indennità di accompagnamento</strong> già riconosciuta dall''INPS con una quota aggiuntiva <strong>fino a 850 € al mese</strong>, riservata agli anziani over 80 con bisogno assistenziale gravissimo e non autosufficienza (<a href="https://fiscomania.com/assegno-assistenza-anziani/">Fiscomania, agosto 2026</a>). L''obiettivo dichiarato della riforma è far crescere l''assistenza domiciliare e ridurre la dipendenza dalle RSA.</p>
<h3>Il bonus caregiver: cosa prevede e a che punto è</h3>
<p>Il <strong>bonus caregiver</strong> è la misura di cui si è parlato di più: l''assegno per chi assiste quotidianamente un familiare non autosufficiente. Va descritta con precisione, perché è <strong>ancora in attesa di approvazione definitiva</strong>: al 14 ottobre 2026 la <strong>domanda online su INPS non era ancora aperta</strong> (<a href="https://www.pmi.it/impresa/normativa/357515/fondo-di-sostegno-per-i-caregiver-cosa-prevede-e-come-accedervi.html">PMI.it</a>). I parametri discussi dalle proposte: un contributo <strong>fino a 400 € al mese</strong>, <strong>ISEE familiare fino a 25.000 €</strong> e almeno <strong>91 ore mensili</strong> di assistenza documentate (<a href="https://www.serenis.it/articoli/bonus-caregiver/">Serenis</a>; <a href="https://www.vidas.it/caregivers/bonus-caregiver/">Vidas</a>).</p>
<blockquote>Regola pratica: fino a quando la piattaforma INPS non apre, trattate ogni cifra del bonus caregiver come un valore atteso, non garantito. Le detrazioni fiscali, invece, sono già applicabili oggi: vedi sotto.</blockquote>
<h2>Le agevolazioni già operative: detrazioni, IVA e contributi</h2>
<p>A differenza dei bonus in arrivo, queste tre leve fiscali sono già utilizzabili nella dichiarazione dei redditi e sugli acquisti:</p>
<ul>
<li><strong>Detrazione IRPEF al 19%</strong>: le spese sanitarie, incluse quelle per dispositivi medici e servizi di assistenza specifici, sono detraibili dall''IRPEF lorda ai sensi dell''art. 15 del TUIR. Il bracciale eCura, essendo un <strong>dispositivo medico Classe IIA</strong> certificato (MDR 2017/745), rientra pienamente: la <a href="/blog/bracciale-anziani-detraibile-19-percento/">guida alla detraibilità al 19%</a> spiega documenti e modalità.</li>
<li><strong>IVA al 4%</strong>: i dispositivi medici certificati beneficiano dell''aliquota agevolata (DPR 633/72, Tabella A, Parte II, n. 30), contro il 22% ordinario. Un risparmio del 18 punti percentuali direttamente sul prezzo.</li>
<li><strong>Contributo INPS per disabili</strong>: per persone con <strong>invalidità 100% e Legge 104</strong>, con ISEE sotto soglia, esistono contributi specifici per l''acquisto di ausili e assistenza, soggetti ad approvazione INPS e disponibilità del fondo. La <a href="/guida-dispositivi-medici-teleassistenza/">guida a certificazioni e detrazioni</a> riassume i casi.</li>
</ul>
<p>Esiste anche l''<strong>HCP — Home Care Premium</strong>, il contributo INPS per l''assistenza domiciliare delle persone non autosufficienti che rimborsa parte delle spese di assistenza privata (<a href="https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.hcp-assistenza-domiciliare-per-persone-non-autosufficienti-home-care-premium--50014.hcp-assistenza-domiciliare-per-persone-non-autosufficienti-home-care-premium-domanda-e-gestione-benefici.html">scheda INPS</a>): va richiesto tramite il Comune o l''ASL di residenza secondo le procedure locali.</p>
<h2>Tabella riassuntiva: chi ha diritto a cosa</h2>
<table>
<tr><th>Misura</th><th>Per chi</th><th>Valore indicativo</th><th>Stato (ott. 2026)</th></tr>
<tr><td>Prestazione Universale (Decreto Anziani)</td><td>Anziani non autosufficienti, bisogno gravissimo</td><td>Quota assistenziale mensile</td><td>In attuazione (vedi INPS)</td></tr>
<tr><td>Assegno di assistenza</td><td>Over 80 non autosufficienti con accompagnamento</td><td>Fino a +850 €/mese</td><td>In attuazione graduale</td></tr>
<tr><td>Bonus caregiver</td><td>Chi assiste un familiare non autosufficiente</td><td>Fino a 400 €/mese (proposto)</td><td>In attesa di approvazione</td></tr>
<tr><td>Detrazione IRPEF 19%</td><td>Chi sostiene spese sanitarie (anche per familiari a carico)</td><td>19% della spesa</td><td>✅ Operativa</td></tr>
<tr><td>IVA 4% dispositivi medici</td><td>Acquisto di dispositivi medici certificati</td><td>-18 punti di IVA</td><td>✅ Operativa</td></tr>
<tr><td>Contributo INPS disabili 100%</td><td>Invalidità 100% + L.104, ISEE sotto soglia</td><td>Variabile secondo fondo</td><td>✅ Operativa, a fondo esaurito</td></tr>
<tr><td>HCP Home Care Premium</td><td>Non autosufficienti con fabbisogno domiciliare</td><td>Rimborso parziale spese assistenza</td><td>✅ Operativa via Comune/ASL</td></tr>
</table>
<p class="src">Importi indicativi secondo le fonti citate; le condizioni definitive sono quelle pubblicate da INPS al momento della domanda.</p>
<h2>Come si combinano con la teleassistenza</h2>
<p>La domanda pratica che le famiglie ci fanno: "posso usare questi bonus per pagare eCura?" Le risposte concrete:</p>
<ul>
<li>La <strong>detrazione del 19%</strong> si applica direttamente all''abbonamento: con il Family Base a €390/anno il risparmio fiscale è di circa €74 l''anno, e si somma all''IVA 4% già applicata per i disabili.</li>
<li>Le misure del <strong>Decreto Anziani</strong> (Prestazione Universale, assegno di assistenza) sono pensate per finanziare l''assistenza domiciliare in senso ampio: la teleassistenza è tra i servizi compatibili con la domiciliarità che la riforma vuole sostenere.</li>
<li>Il <strong>bonus caregiver</strong>, quando sarà operativo, compenserà parte del costo-opportunità di chi assiste: usato insieme alla teleassistenza, copre la parte di sorveglianza che nessuna famiglia riesce a garantire H24 (vedi <a href="/blog/badante-vs-teleassistenza-costi-2026/">badante vs teleassistenza</a>).</li>
<li>Il piano <strong>Premium</strong>, con le sue <a href="/blog/analisi-report-servizio-premium/">analisi e report di salute</a>, è il modo di trarre il massimo dalla stessa spesa deducibile: più valore clinico coperto dalla detrazione del 19%.</li>
</ul>
<p>Per una valutazione dei benefici applicabili al vostro caso specifico (IVA ridotta, detrazione, contributi): <a href="mailto:info@ecura.it">info@ecura.it</a>.</p>
<div class="cta">
<div class="cta-title">🛡️ eCura: detraibile al 19%, IVA 4% per i disabili</div>
<p>Dispositivo medico certificato Classe IIA · Da €390/anno · Nessun costo di attivazione · Garanzia 30 giorni</p>
<a href="/#contattaci">Richiedi informazioni gratuite →</a>
</div>
<h2>Fonti e riferimenti</h2>
<ul>
<li>INPS — <a href="https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.decreto-anziani-prestazione-universale.html">Decreto Anziani: Prestazione Universale</a> e <a href="https://www.inps.it/it/it/dettaglio-scheda.it.schede-servizio-strumento.schede-servizi.hcp-assistenza-domiciliare-per-persone-non-autosufficienti-home-care-premium--50014.hcp-assistenza-domiciliare-per-persone-non-autosufficienti-home-care-premium-domanda-e-gestione-benefici.html">HCP Home Care Premium</a>.</li>
<li>PMI.it — <a href="https://www.pmi.it/impresa/normativa/357515/fondo-di-sostegno-per-i-caregiver-cosa-prevede-e-come-accedervi.html">Bonus Caregiver 2026: stato dell''attivazione</a> (14 ottobre 2026).</li>
<li>Serenis — <a href="https://www.serenis.it/articoli/bonus-caregiver/">Bonus caregiver: requisiti e ISEE</a>; Vidas — <a href="https://www.vidas.it/caregivers/bonus-caregiver/">Bonus caregiver: cosa spetta</a>.</li>
<li>Fiscomania — <a href="https://fiscomania.com/assegno-assistenza-anziani/">Assegno di Assistenza Anziani 2026</a>.</li>
<li>Guida interna — <a href="/blog/bracciale-anziani-detraibile-19-percento/">Detraibilità 19% del bracciale eCura</a>.</li>
</ul>
<h2>Domande frequenti</h2>
<details><summary>Posso detrarre il bracciale eCura se lo pago io per mio genitore?</summary><div><p>Sì: la detrazione del 19% spetta a chi sostiene la spesa per sé o per un familiare fiscalmente a carico, o con le modalità descritte nella guida alla detrazione (ad esempio intestando il contratto al genitore che presenta la dichiarazione in Italia).</p></div></details>
<details><summary>Il bonus caregiver 2026 si sta già aspettando? Quando si chiede?</summary><div><p>Al 14 ottobre 2026 la piattaforma INPS non era ancora aperta: la misura è in attesa di approvazione definitiva. Le cifre (400 €/mese, ISEE 25.000 €) sono i parametri discussi, non garantiti. Monitorate le comunicazioni INPS prima di fare affidamento sul bonus nel budget familiare.</p></div></details>
<details><summary>Che cos''è l''assegno di assistenza per gli anziani?</summary><div><p>È la misura del Decreto Anziani che integra l''indennità di accompagnamento con una quota fino a 850 € al mese per gli anziani over 80 con bisogno assistenziale gravissimo e non autosufficienza, per sostenere l''assistenza domiciliare.</p></div></details>
<details><summary>Perché eCura ha l''IVA al 4%?</summary><div><p>Perché è un dispositivo medico certificato Classe IIA (MDR 2017/745): i dispositivi medici rientrano nell''aliquota agevolata del 4% (DPR 633/72, Tabella A, Parte II, n. 30), invece del 22% ordinario.</p></div></details>
<details><summary>Esistono contributi regionali o comunali per la teleassistenza?</summary><div><p>Sì: molte Regioni e Comuni offrono bandi o contributi domiciliari (a volte tramite il Servizio Sociale). Valgono le regole locali: il punto di partenza è l''assistente sociale del Comune di residenza, insieme all''HCP INPS per i non autosufficienti.</p></div></details>
',
  'bracciale-anziani-detraibile-19-percento',
  'Bracciale Anziani Detraibile al 19%: guida completa 2026',
  'Come detrarre il bracciale eCura (dispositivo medico Classe IIA) al 19%.',
  'Fiscale',
  'badante-vs-teleassistenza-costi-2026',
  'Badante vs Teleassistenza: costi, pro e contro nel 2026',
  'Badante convivente o teleassistenza? Costi e differenze a confronto.',
  'Confronto',
  'teleassistenza-anziani-come-funziona-costi',
  'Teleassistenza Anziani: come funziona e quanto costa nel 2026',
  'Cos''è la teleassistenza, come funziona la centrale H24 e i costi reali.',
  'Informazione',
  'published'
);
