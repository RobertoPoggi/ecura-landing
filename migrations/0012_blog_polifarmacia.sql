-- Migration 0012: articolo blog — Polifarmacia nell'anziano: rischi e promemoria
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
  'polifarmacia-anziani-promemoria-farmaci',
  'Polifarmacia nell''anziano: rischi e promemoria',
  'In media 7,6 farmaci al giorno per anziano: rischi di dimenticanze, interazioni e doppie dosi, e come promemoria e app aiutano la famiglia.',
  'Salute',
  '#068D86',
  'Redazione eCura',
  '2026-10-23',
  '2026-10-23',
  '8 min lettura',
  'https://www.ecura.it/img/blog/polifarmacia-promemoria-farmaci.jpg',
  'Anziano guarda il promemoria farmaci al polso, con pillbox e bicchiere d''acqua',
  'L''anziano italiano assume in media 7,6 principi attivi al giorno (8,7 oltre gli 85 anni), e due su tre ne prendono almeno cinque. La polifarmacia è spesso necessaria (pressione, diabete, cuore), ma porta con sé tre rischi concreti: dimenticanze, doppie dosi e interazioni tra farmaci.',
  '<div class="img-caption hero-caption">Il promemoria arriva al polso al momento giusto: la conferma è visibile nell''app dei familiari, anche a distanza. · <em>Immagine generata con IA</em></div>
<div class="sintesi">
<div class="sintesi-title">In sintesi</div>
<p>L''anziano italiano assume in media <strong>7,6 principi attivi al giorno</strong> (8,7 oltre gli 85 anni), e due su tre ne prendono almeno cinque. La polifarmacia è spesso necessaria (pressione, diabete, cuore), ma porta con sé tre rischi concreti: dimenticanze, doppie dosi e interazioni tra farmaci. In questo articolo: perché succede, i segnali d''allarme e le strategie pratiche per gestire la terapia, anche quando i figli vivono lontano.</p>
</div>
<div class="callout"><strong>⚡ Risposta rapida:</strong> la polifarmacia, cioè l''assunzione di 5 o più farmaci al giorno, riguarda circa due anziani italiani su tre e comporta rischio di dimenticanze, doppie dosi e interazioni dannose. Le misure che funzionano: una lista scritta di tutti i farmaci, la revisione periodica con il medico di base, e promemoria automatici (come i promemoria farmaci vocali del bracciale eCura, confermabili dall''app dei familiari) che rendono l''aderenza visibile a distanza.</div>

<div class="stats">
<div class="stat"><b>7,6</b><span> principi attivi assunti in media ogni giorno da un anziano italiano (FADOI)</span></div>
<div class="stat"><b>2 su 3</b><span> anziani assumono almeno 5 farmaci al giorno</span></div>
<div class="stat"><b>1 su 4</b><span> è a rischio reazioni avverse da farmaci (Federfarma)</span></div>
</div>
<h2>Quanto è diffusa la polifarmacia nell''anziano italiano</h2>
<p>I numeri fotografano una situazione di sistema, non di singoli casi:</p>
<ul>
<li>Ogni anziano assume in media <strong>7,6 principi attivi al giorno</strong>, che diventano <strong>8,7 negli over 85</strong>; la polifarmacoterapia è ormai "la norma", e il 65% della spesa farmaceutica italiana riguarda gli anziani (<a href="https://www.quotidianosanita.it/scienza-e-farmaci/il-della-spesa-farmaceutica-in-italia-per-gli-anziani-ma-con-poca-aderenza-alle-cure-fadoi-polifarmacoterapia-una-realt-che-va-gestita-attentamente/">FADOI / Quotidiano Sanità, novembre 2025</a>).</li>
<li><strong>Il 66,6% degli anziani</strong> (2 su 3) assume ogni giorno almeno cinque farmaci, e il <strong>26,8%</strong> (1 su 4) addirittura dieci o più (<a href="https://www.italialongeva.it/aree-tematiche/cultura-della-longevita/anziani-e-farmaci-dieci-regole-per-la-corretta-assunzione/">Italia Longeva</a>).</li>
<li><strong>Un anziano su quattro è a rischio reazioni avverse</strong> da farmaci, e circa due milioni di anziani sono esposti a interazioni per abuso o sovrapposizione (<a href="https://www.federfarma.it/Edicola/Filodiretto/VediNotizia.aspx?id=23260">Federfarma</a>).</li>
</ul>
<p>La polifarmacia in sé non è un errore: a 80 anni con ipertensione, diabete e fibrillazione atriale, cinque o sette farmaci possono essere la terapia giusta. Il problema è <strong>come viene gestita</strong>, e qui emergono gli errori quotidiani.</p>
<h2>I tre rischi concreti di una terapia "gestita male"</h2>
<h3>1. Le dimenticanze e le doppie dosi</h3>
<p>Con sette assunzioni al giorno, la memoria basta spesso a creare l''alternativa peggiore: farmaci saltati nei giorni normali, <strong>doppie dosi per "rimediare"</strong> il giorno dopo. Con gli antipertensivi e gli anticoagulanti, questa oscillazione è pericolosa quanto l''omissione. Chi ha una lieve disattenzione cognitiva (spesso il primo segno, non diagnosticato) è il caso più a rischio.</p>
<h3>2. Le interazioni</h3>
<p>Più farmaci interagiscono: un integratore comprato in autonomia, un antiinfiammatorio prescritto da due specialisti diversi, un farmaco preso con il latte invece che a stomaco vuoto. Un anziano su quattro è già a rischio reazioni avverse (Federfarma): ogni farmaco "di più" non prescritto insieme agli altri aumenta il rischio.</p>
<h3>3. Il collegamento con le cadute</h3>
<p>Sedativi, antipertensivi, diuretici e alcuni psicofarmaci causano vertigini, ipotensione ortostatica e necessità notturna di urinare. Sono i fattori che moltiplicano il rischio di caduta, soprattutto <strong>nei tragitti notturni al bagno</strong> (vedi <a href="/blog/cadute-in-bagno-anziani-prevenzione/">cadute in bagno</a> e <a href="/blog/prevenzione-cadute-anziani-10-consigli/">prevenzione cadute</a>). La terapia e la sicurezza domestica sono lo stesso problema visto da due lati.</p>
<h2>Le strategie che funzionano (in ordine di priorità)</h2>
<ol>
<li><strong>La lista scritta unica</strong>: un solo foglio con tutti i farmaci (anche quelli senza prescrizione), dosi, orari e indicazioni. Va aggiornata a ogni visita e portata al medico: è lo strumento più potente contro le sovrapposizioni.</li>
<li><strong>La revisione periodica della terapia</strong>: una volta l''anno (o dopo ogni ricovero) il medico di base dovrebbe rileggere l''intera lista per deprescrivere ciò che non serve più. Dopo la dimissione è <strong>obbligatoria in pratica</strong>: le sovrapposizioni tra terapia ospedaliera e di casa sono l''errore più frequente (vedi <a href="/blog/cadute-post-dimissione-ospedale-prevenzione/">il rientro post-dimissione</a>).</li>
<li><strong>Un contenitore settimanale (pillbox)</strong> preparato ogni domenica: rende visibile a colpo d''occhio se la dose è stata presa. Funziona se l''anziano è collaborante e la vista regge.</li>
<li><strong>I promemoria automatici</strong>: per chi non è affidabile con il telefono, il <strong>bracciale eCura Professional vibra all''orario programmato e dà il promemoria vocale</strong> per ogni farmaco. La conferma di assunzione è visibile nell''app dei familiari: se alle 20 non è confermata, i figli lo sanno anche da 400 km di distanza, e ogni assunzione alimenta le <a href="/blog/analisi-report-servizio-premium/">analisi e report del servizio Premium</a> da mostrare al medico.</li>
<li><strong>Farmacia di fiducia</strong>: far preparare il <strong>bilanciere (blister mensile)</strong> direttamente in farmacia: riduce gli errori di manipolazione e dà un controllo aggiuntivo sui refusi di prescrizione.</li>
</ol>
<h2>Gestire i farmaci quando i figli vivono lontano</h2>
<p>Il caso tipico: il genitore vive solo, la terapia è complessa, e i figli hanno due opzioni sbagliate: chiamare a ogni ora ("mamma, hai preso la pillola?") o non sapere nulla fino alla prossima visita. La terza via è rendere l''aderenza <strong>osservabile senza sorveglianza</strong>:</p>
<ul>
<li>i promemoria si impostano e si modificano <strong>dall''app, da qualsiasi paese</strong> (vedi <a href="/blog/caregiver-distanza-genitori-anziani-estero/">caregiver a distanza</a>);</li>
<li>il genitore riceve il promemoria al polso, vibra e parla: non deve aprire app né smartphone;</li>
<li>la conferma (o la mancata conferma) è visibile a tutti i familiari collegati: nessuno deve fare la "telefonata della pillola";</li>
<li>in caso di anomalia rilevante, i parametri vitali (frequenza cardiaca, SpO2 nei piani Professional e Premium) danno un contesto in più per capire se è solo una dimenticanza o un malessere.</li>
</ul>
<div class="cta">
<div class="cta-title">💊 Promemoria farmaci vocali, direttamente al polso</div>
<p>Bracciale eCura Professional · Promemoria vocali · Conferma visibile nell''app · Parametri vitali certificati · Da €480/anno · Detraibile al 19%</p>
<a href="/#contattaci">Richiedi informazioni gratuite →</a>
</div>
<h2>Fonti e riferimenti</h2>
<ul>
<li>Quotidiano Sanità / FADOI — <a href="https://www.quotidianosanita.it/scienza-e-farmaci/il-della-spesa-farmaceutica-in-italia-per-gli-anziani-ma-con-poca-aderenza-alle-cure-fadoi-polifarmacoterapia-una-realt-che-va-gestita-attentamente/">Polifarmacoterapia negli anziani: 7,6 principi attivi medi</a> (novembre 2025).</li>
<li>Italia Longeva — <a href="https://www.italialongeva.it/aree-tematiche/cultura-della-longevita/anziani-e-farmaci-dieci-regole-per-la-corretta-assunzione/">Anziani e farmaci: 10 regole</a> (66,6% assume almeno 5 farmaci).</li>
<li>Federfarma — <a href="https://www.federfarma.it/Edicola/Filodiretto/VediNotizia.aspx?id=23260">Anziani e rischio interazioni da farmaci</a>.</li>
<li>Guida interna — <a href="/blog/cadute-post-dimissione-ospedale-prevenzione/">Il rientro post-dimissione: revisione dei farmaci</a>.</li>
</ul>
<h2>Domande frequenti</h2>
<details><summary>Quanti farmaci al giorno si considera "polifarmacia"?</summary><div><p>La soglia convenzionale è 5 o più farmaci assunti quotidianamente, una condizione che riguarda circa due anziani italiani su tre. Oltre le 10 assunzioni si parla di polifarmacia "eccessiva", associata al rischio più elevato di interazioni ed effetti avversi.</p></div></details>
<details><summary>Mio padre salta i farmaci e poi raddoppia la dose: quanto è grave?</summary><div><p>Con alcuni farmaci (anticoagulanti, antipertensivi, antidiabetici) la doppia dose può essere tanto pericolosa quanto la dimenticanza. Non correggete da soli: segnate gli episodi su un quaderno e portateli al medico di base, che può rivedere orari e formati (o passare a un bilanciere farmaceutico) per ridurre l''errore umano.</p></div></details>
<details><summary>Come posso controllare i farmaci di mio padre se vivo all''estero?</summary><div><p>Con i promemoria farmaci vocali del bracciale eCura: impostate orari e farmaci dall''app (da qualsiasi paese), il genitore riceve il promemoria al polso, e la conferma di assunzione è visibile a tutti i familiari collegati, senza telefonate di controllo.</p></div></details>
<details><summary>Il promemoria del bracciale funziona per anziani che non usano lo smartphone?</summary><div><p>Sì, è pensato proprio per loro: il bracciale vibra e dà il promemoria vocalmente all''orario programmato. L''anziano non interagisce con nessuna app; tutto è gestito dai familiari dal proprio telefono.</p></div></details>
<details><summary>Il bilanciere in farmacia è coperto dal Servizio Sanitario?</summary><div><p>Dipende dalla Regione e dalla tipologia di servizio: in molti casi è un servizio a pagamento a costi contenuti, spesso rimborsabile tramite il fondo HCP INPS per i non autosufficienti. Chiedete in farmacia o al Servizio Sociale del Comune.</p></div></details>
',
  'cadute-post-dimissione-ospedale-prevenzione',
  'Dopo il ricovero: prevenire le cadute in 30 giorni',
  'Le settimane a più alto rischio: checklist della casa, farmaci e teleassistenza.',
  'Prevenzione',
  'analisi-report-servizio-premium',
  'Analisi e report di salute nel servizio Premium',
  'Come leggere dashboard, sonno, saturazione e Riepilogo AI.',
  'Servizio Premium',
  'prevenzione-cadute-anziani-10-consigli',
  'Prevenzione Cadute Anziani: 10 consigli pratici per la casa',
  '10 interventi concreti per ridurre il rischio cadute: checklist stampabile.',
  'Prevenzione',
  'published'
);
