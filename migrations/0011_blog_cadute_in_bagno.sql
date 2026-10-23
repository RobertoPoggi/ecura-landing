-- Migration 0011: articolo blog — Cadute in bagno: come rendere il bagno sicuro
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
  'cadute-in-bagno-anziani-prevenzione',
  'Cadute in bagno: come rendere il bagno sicuro',
  'Il bagno è dove gli anziani cadono di più e peggio: perché, i dati e la guida per renderlo sicuro (maniglioni, doccia, luci, teleassistenza).',
  'Prevenzione',
  '#068D86',
  'Redazione eCura',
  '2026-10-23',
  '2026-10-23',
  '8 min lettura',
  'https://www.ecura.it/img/blog/cadute-in-bagno.jpg',
  'Anziana al sicuro sulla seduta doccia in un bagno con maniglioni, dispositivo al polso',
  'Il bagno è l''ambiente di casa dove le cadute degli anziani sono più frequenti e più gravi. Superfici bagnate e scivolose, passaggi stretti, il momento critico dell''uscita da doccia e vasca.',
  '<div class="img-caption hero-caption">Il bagno, ambiente a più alto rischio: sedile, maniglioni e un dispositivo che si può indossare anche sotto la doccia. · <em>Immagine generata con IA</em></div>
<div class="sintesi">
<div class="sintesi-title">In sintesi</div>
<p>Il bagno è l''ambiente di casa dove le cadute degli anziani sono più frequenti e più gravi. Superfici bagnate e scivolose, passaggi stretti, il momento critico dell''uscita da doccia e vasca. E la circostanza aggravante: l''anziano è quasi sempre solo, spesso seminudo e lontano dal telefono. In questo articolo trovate i dati, i quattro momenti di rischio, la checklist del bagno sicuro e la rete di sicurezza per il caso in cui la caduta avvenga comunque.</p>
</div>
<div class="callout"><strong>⚡ Risposta rapida:</strong> il bagno è la stanza più pericolosa della casa per un anziano, per superfici bagnate, spazi stretti e il momento critico dell''uscita da doccia o vasca. Le misure che contano di più: maniglioni veri (non il portasciugamani), doccia con sedile e tappetino antiscivolo, luci notturne, percorsi liberi. E una rete di sicurezza: un bracciale impermeabile IP67 con rilevamento cadute automatico, indossabile anche sotto la doccia.</div>

<div class="stats">
<div class="stat"><b>2/3</b><span> delle cadute in bagno coinvolgono doccia o vasca: il momento critico è l''uscita</span></div>
<div class="stat"><b>22%</b><span> degli anziani che hanno caduto usa maniglioni dopo l''episodio (ISS)</span></div>
<div class="stat"><b>28,6%</b><span> degli anziani cade almeno una volta l''anno (ISS)</span></div>
</div>
<h2>Perché proprio il bagno</h2>
<p>Il bagno concentra tutti i fattori di rischio della casa in pochi metri quadrati:</p>
<ol>
<li><strong>Superfici bagnate e saponose</strong>: piastrelle lisce, residui di bagnoschiuma, umidità che non si asciuga mai davvero.</li>
<li><strong>Spazi stretti</strong>: poco spazio per correggere uno sbilanciamento, angoli duri a portata di fianco e testa.</li>
<li><strong>Doccia e vasca</strong>: sono i sanitari più pericolosi, coinvolti nella maggior parte delle cadute in bagno. Il momento critico però non è dentro, ma <strong>l''uscita</strong>, quando si alza una gamba su una superficie sconnessa (<a href="https://lineaoceano.it/posto-pericoloso-bagno/">analisi sul tema</a>).</li>
<li><strong>Solitudine</strong>: quasi sempre l''anziano è solo, senza telefono a portata di mano, spesso con l''acqua in corso che maschera i rumori di un eventuale chiamata d''aiuto.</li>
</ol>
<p>La conseguenza è la combinazione peggiore possibile: cadute frequenti <em>e</em> ritrovamento tardivo. Nel frattempo, gli interventi di adattamento restano rari: secondo i dati ISS del sistema di sorveglianza PASSI d''Argento, tra gli anziani che hanno subito cadute solo il <strong>22% usa maniglioni</strong> e il <strong>17% un seggiolino per la doccia</strong> (<a href="https://www.epicentro.iss.it/passi-argento/dati/cadute-12-mesi">ISS, Epicentro</a>). Parliamo di una stanza dove questi due oggetti fanno la differenza principale.</p>
<blockquote>La maggior parte delle cadute degli anziani in casa avviene proprio in bagno: è il motivo per cui un dispositivo di sicurezza che non si può indossare sotto la doccia lascia scoperto il momento peggiore della giornata.</blockquote>
<h2>I quattro momenti di rischio (e cosa fare per ognuno)</h2>
<h3>1. Entrare e uscire da doccia o vasca</h3>
<p>È il passaggio con il più alto tasso di cadute: superare il bordo della vasca, alzare la gamba sul bordo della doccia, spostare il peso su una superficie bagnata. Gli interventi che contano: <strong>sostituire la vasca con una doccia a filo pavimento</strong> quando è possibile (la vasca è il sanitario più rischioso), installare un <strong>sedile doccia</strong> stabile e <strong>maniglioni dedicati</strong> in prossimità dell''uscita.</p>
<h3>2. I tragitti notturni al bagno</h3>
<p>La necessità di urinare di notte, aggravata da diuretici e problemi prostatici, manda l''anziano al buio su un percorso non illuminato. Le misure, qui, sono semplici: <strong>luci notturne con sensore</strong> tra camera e bagno, percorso libero da ostacoli, un bagno di servizio assegnato alla notte quando esiste.</p>
<h3>3. Il WC: sedersi e rialzarsi</h3>
<p>Il rialzo dal water è uno sforzo di equilibrio e forza che un anziano fragilizzato può non riuscire a controllare. Qui servono <strong>maniglioni ai lati del WC</strong> (o un rialzo con braccioli). Niente portasciugamani usati come appoggio: si staccano e la caduta è garantita.</p>
<h3>4. Lavarsi e piegarsi</h3>
<p>Abbassarsi per raccogliere, protendersi per il lavandino, ruotare il busto mentre si è in equilibrio su una gamba. Gli accorgimenti: oggetti di uso quotidiano <strong>a portata di mano senza piegarsi</strong>, tappetino antiscivolo dentro e fuori la doccia, asciugatura immediata delle pozze.</p>
<h2>La checklist del bagno sicuro</h2>
<div class="checklist">
<h3>✓ Interventi in ordine di priorità</h3>
<ul>
<li><strong>Maniglioni</strong> avvitati alle strutture (non a ventosa): dentro la doccia, all''uscita, ai lati del WC. Il più sottovalutato di tutti: usato solo dal 22% degli anziani che hanno già caduto (ISS).</li>
<li><strong>Sedile doccia</strong> o seduta portatile stabile: sedersi per lavarsi dimezza il tempo in piedi su superficie bagnata.</li>
<li><strong>Tappetini antiscivolo</strong> con ventose dentro la doccia e superficie assorbente fuori.</li>
<li><strong>Doccia al posto della vasca</strong>, a filo pavimento se si ristruttura: la vasca è il sanitario più rischioso.</li>
<li><strong>Luci notturne</strong> (con sensore o interruttore facile) sul percorso camera-bagno e dentro il bagno.</li>
<li><strong>Pavimento asciutto subito</strong>: un panno a portata di mano e l''abitudine ad asciugare le pozze.</li>
<li><strong>Scaldabagno regolato moderato</strong> (intorno ai 40-50°C) per evitare scottature in caso di caduta con acqua calda in corso.</li>
<li><strong>Il <a href="/blog/guida-bracciale-cadute-anziani-2026/">bracciale eCura</a> sempre al polso</strong>: certificato IP67, si può indossare in doccia e in bagno, dove il telefono di casa non c''è e il bracciale sì.</li>
</ul>
</div>
<h2>La rete di sicurezza: se la caduta avviene comunque</h2>
<p>Nessun adattamento rende il bagno a prova di caduta: l''obiettivo realistico è ridurne il rischio e <strong>accorciare drasticamente il tempo fino all''aiuto</strong> quando accade. Il bracciale eCura (dispositivo medico certificato Classe IIA) copre esattamente lo scenario del bagno:</p>
<ul>
<li><strong>Funziona sotto la doccia</strong>, grazie alla certificazione IP67: è uno dei pochi dispositivi che non va tolto proprio dove il rischio è massimo;</li>
<li><strong>rileva la caduta in automatico</strong> (AI addestrata su 14.000 cadute reali): l''anziano non deve arrivare al telefono né premere nulla;</li>
<li>la <strong>Centrale Operativa H24</strong> chiama al polso entro 30 secondi e coordina i soccorsi 118 all''indirizzo esatto se non risponde;</li>
<li>i familiari ricevono la <strong>notifica in tempo reale</strong>, ovunque si trovino;</li>
<li>nel piano <strong>Premium</strong>, ogni parametro misurato, anche qui in bagno, alimenta le <a href="/blog/analisi-report-servizio-premium/">analisi e report di salute</a>: l''episodio diventa un dato che il medico può vedere, non solo un ricordo della famiglia.</li>
</ul>
<p>Cinque minuti per terra nel bagno o una notte intera fanno una differenza enorme: il secondo scenario, con l''ipotermia e la rabdomiolisi che ne seguono, è quello che trasforma una caduta in una tragedia.</p>
<div class="cta">
<div class="cta-title">🛡️ Bracciale eCura: si indossa anche in doccia</div>
<p>Certificazione IP67 · Rilevamento cadute automatico · Centrale H24 · Da €390/anno · Detraibile al 19%</p>
<a href="/#contattaci">Richiedi informazioni gratuite →</a>
</div>
<h2>Fonti e riferimenti</h2>
<ul>
<li>ISS, Epicentro — sistema di sorveglianza <a href="https://www.epicentro.iss.it/passi-argento/dati/cadute-12-mesi">PASSI d''Argento: cadute negli ultimi 12 mesi</a> (uso di maniglioni 22%, seggiolini 17%).</li>
<li>ISS, Epicentro — <a href="https://www.epicentro.iss.it/incidenti-domestici/rischi-cadute-anziani">Le cadute negli anziani</a> (28,6% cade almeno una volta l''anno).</li>
<li>Guida interna — <a href="/blog/prevenzione-cadute-anziani-10-consigli/">Prevenzione cadute: 10 consigli per la casa</a>.</li>
</ul>
<h2>Domande frequenti</h2>
<details><summary>Si può davvero indossare il bracciale eCura sotto la doccia?</summary><div><p>Sì: il bracciale è certificato IP67, quindi impermeabile a immersioni e getti d''acqua. È una scelta di progetto precisa: il bagno è l''ambiente dove le cadute sono più frequenti, e un dispositivo da togliere sarebbe inutile proprio nel momento peggiore.</p></div></details>
<details><summary>Maniglioni a ventosa o avvitati?</summary><div><p>Avvitati alle strutture, sempre. I maniglioni a ventosa si staccano sotto carico, esattamente quando servono, e danno una falsa sicurezza. Un''installazione professionale costa poco e vale tutta la differenza.</p></div></details>
<details><summary>Il portasciugamani può fare da appoggio?</summary><div><p>No: è progettato per il peso di un asciugamano, non di una persona. Si stacca dalla parete e la caduta segue. In ogni bagno frequentato da un anziano fragilizzato servono maniglioni veri.</p></div></details>
<details><summary>Doccia o vasca: quale è più sicura per un anziano?</summary><div><p>La doccia, nettamente: superare il bordo della vasca è tra i gesti più rischiosi della giornata di un anziano. Se si ristruttura, una doccia a filo pavimento con sedile è la soluzione più sicura; se non si ristruttura, sedile e maniglioni riducono comunque molto il rischio.</p></div></details>
<details><summary>Come viene rilevata una caduta in bagno se l''anziano non chiama?</summary><div><p>Il rilevamento è automatico: l''AI del bracciale riconosce il pattern della caduta entro 3-5 secondi e attiva la procedura di emergenza. La Centrale H24 chiama al polso e, se non c''è risposta, allerta i soccorsi con la posizione esatta.</p></div></details>
',
  'prevenzione-cadute-anziani-10-consigli',
  'Prevenzione Cadute Anziani: 10 consigli pratici per la casa',
  '10 interventi concreti per ridurre il rischio cadute: checklist stampabile.',
  'Prevenzione',
  'cadute-post-dimissione-ospedale-prevenzione',
  'Dopo il ricovero: prevenire le cadute in 30 giorni',
  'Le settimane a più alto rischio: checklist della casa, farmaci e teleassistenza.',
  'Prevenzione',
  'guida-bracciale-cadute-anziani-2026',
  'Guida ai Bracciali Cadute Anziani 2026: come scegliere il migliore',
  'GPS, SOS automatico, Classe IIA: tutto per scegliere il dispositivo giusto.',
  'Guida',
  'published'
);
