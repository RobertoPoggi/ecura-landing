-- Migration 0009: articolo blog — Dopo il ricovero: prevenire le cadute in 30 giorni
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
  'cadute-post-dimissione-ospedale-prevenzione',
  'Dopo il ricovero: prevenire le cadute in 30 giorni',
  'Dopo un ricovero il rischio cadute esplode. Checklist della casa, farmaci, esercizio e teleassistenza per i primi 30 giorni a casa dell''anziano.',
  'Prevenzione',
  '#068D86',
  'Redazione eCura',
  '2026-10-23',
  '2026-10-23',
  '8 min lettura',
  'https://www.ecura.it/img/blog/cadute-post-dimissione.jpg',
  'Anziano in convalescenza sul divano con il dispositivo al polso',
  'Le settimane subito dopo una dimissione ospedaliera sono il periodo a più alto rischio di caduta per un anziano: muscoli indeboliti dal letto, farmaci nuovi, casa che nel frattempo è diventata "sconosciuta". In questo articolo: perché il rischio è così alto, cosa preparare prima che il genitore torni a casa, una checklist per il primo mese e come la teleassistenza copre le ore in cui nessuno dei figli può esserci.',
  '<div class="img-caption hero-caption">Il rientro dopo il ricovero: le settimane a più alto rischio, coperte anche quando i familiari non possono esserci. · <em>Immagine generata con IA</em></div>
<div class="sintesi">
<div class="sintesi-title">In sintesi</div>
<p>Le settimane subito dopo una dimissione ospedaliera sono il periodo a più alto rischio di caduta per un anziano: muscoli indeboliti dal letto, farmaci nuovi, casa che nel frattempo è diventata "sconosciuta". In questo articolo: perché il rischio è così alto, cosa preparare <em>prima</em> che il genitore torni a casa, una checklist per il primo mese e come la teleassistenza copre le ore in cui nessuno dei figli può esserci.</p>
</div>
<div class="callout"><strong>⚡ Risposta rapida:</strong> nei primi 30 giorni dopo la dimissione l''anziano è a massimo rischio di caduta: forza ridotta dalla degenza, farmaci nuovi che causano vertigini, casa non più adatta alle sue condizioni. Preparate la casa prima del rientro (luci notturne, bagno sicuro, percorsi liberi), fate revisionare i farmaci entro una settimana e coprite le ore in cui resta da solo con la teleassistenza.</div>

<div class="stats">
<div class="stat"><b>14%</b><span>dei pazienti viene riammesso entro 30 giorni dalla dimissione</span></div>
<div class="stat"><b>-20%</b><span>di rischio cadute con la prevenzione multifattoriale</span></div>
<div class="stat"><b>30 gg</b><span>la finestra critica da presidiare dopo il rientro</span></div>
</div>
<h2>Perché i primi 30 giorni dopo la dimissione sono così pericolosi</h2>
<p>La degenza stessa indebolisce: pochi giorni a letto bastano a ridurre forza, equilibrio e riflessi in una persona over 70, e i ricoveri durano spesso settimane. Al rientro si sommano poi tre fattori che la letteratura indica tra le principali cause di caduta a domicilio:</p>
<ol>
<li><strong>Perdita di forza e di capacità motorie</strong>: il genitore si sente come prima, ma il corpo non è più quello di 40 giorni prima. Camminare fino al bagno sembra routine; non lo è più.</li>
<li><strong>Farmaci nuovi o cambiati</strong>: sedativi, antipertensivi, diuretici e oppioidi aumentano vertigini, ipotensione ortostatica e necessità notturna di urinare, cioè i tragitti più pericolosi: di notte, al buio.</li>
<li><strong>La casa è rimasta quella di prima, ma lui no</strong>: un tappeto, una luce mancante nel corridoio, un bagno senza maniglioni. Cose che prima non erano un problema e adesso lo diventano.</li>
</ol>
<p>Il dato che rende la finestra critica: circa il <strong>14% dei pazienti anziani viene riammesso entro 30 giorni dalla dimissione</strong> (<a href="https://www.quotidianosanita.it/scienza-e-farmaci/prevenire-le-cadute-degli-anziani-dopo-le-dimissioni-dall-ospedale/">Quotidiano Sanità</a>), e una delle cause più frequenti delle riammissioni sono proprio le cadute con frattura. Un secondo ricovero, in particolare una frattura del femore, peggiora sensibilmente la prognosi e l''autonomia.</p>
<p>Non tutto è destinazione fatale: gli studi sui programmi di prevenzione multifattoriale mostrano che interventi coordinati (valutazione del rischio, adattamento della casa, revisione dei farmaci, esercizio) possono ridurre il rischio di cadute post-dimissione di circa il <strong>20%</strong> (<a href="https://www.valoreinrsa.it/images/strumenti_di_lavoro/cadute/raccomandazioni/quadernoprevenzionedellecaduteweb.pdf">NEJM 2003, citato nelle raccomandazioni ministeriali</a>). Questi interventi però vanno organizzati <strong>prima</strong> del rientro, non dopo il primo incidente.</p>
<h2>Prima del rientro: la checklist della casa</h2>
<p>Se avete qualche giorno di preavviso, spendetelo qui. L''obiettivo è che nei primi 15 giorni il genitore si muova in un ambiente "facile":</p>
<div class="checklist">
<h3>✓ Checklist pre-rientro</h3>
<ul>
<li><strong>Camminata sicura dal letto al bagno</strong>: percorso libero da cavi, tappeti e scatoli. I tappeti si fissano o si tolgono.</li>
<li><strong>Luci notturne</strong>: un lampione tra camera e bagno (o luci con sensore): il tragitto notturno al buio è la caduta classica.</li>
<li><strong>Bagno</strong>: sedile doccia, maniglioni (non il portasciugamani), tappetino antiscivolo. Nella <a href="/blog/prevenzione-cadute-anziani-10-consigli/">guida alla prevenzione delle cadute in casa</a> trovate l''elenco completo degli interventi, con priorità e costi indicativi.</li>
<li><strong>Oggetti quotidiani a portata di mano</strong> (tra i 60 e i 140 cm di altezza): niente sgabelli, niente "si può arrivare col dito".</li>
<li><strong>Telefonini e numeri importanti</strong> annotati in grande vicino al telefono o sul frigo.</li>
<li><strong>Porta chiavi e citofono accessibili</strong> (per l''emergenza e per chi viene a casa).</li>
</ul>
</div>
<h2>I primi 30 giorni: cosa fare, giorno per giorno</h2>
<h3>Farmaci: la revisione che nessuno fa</h3>
<p>Alla dimissione arrivano spesso farmaci nuovi, e tra le prescrizioni ospedaliere e quelle di casa si creano sovrapposizioni. Cosa fare:</p>
<ol>
<li>Chiedere al medico di base una <strong>revisione della terapia</strong> entro la prima settimana.</li>
<li>Fare una lista scritta di tutti i farmaci con orari, e incollarla dove li si prende.</li>
<li>Attivare promemoria: se il genitore non è affidabile con il telefono, il <strong>bracciale eCura ha promemoria farmaci vocali</strong> che vibrano al polso all''orario giusto, e l''assunzione si può confermare dall''app dei familiari.</li>
</ol>
<h3>Movimento: lentamente, ma ogni giorno</h3>
<p>Il riposo a letto prolungato è nemico: ogni giorno di immobilità toglie forza. Con il via libera del medico o del fisioterapista:</p>
<ul>
<li>brevi passeggiate in casa ogni 2-3 ore;</li>
<li>esercizi di equilibrio semplici (in piedi tenendosi al tavolo, alzarsi dalla sedia);</li>
<li>se prescritto, fisioterapia a domicilio o in ambulatorio, da non saltare nemmeno quando "si sente bene".</li>
</ul>
<h3>Chi assiste: organizzare le prime settimane</h3>
<p>I figli raramente possono prendersi due settimane di ferie. Le opzioni che le famiglie combinano:</p>
<ul>
<li>un turno di presenza nei primi giorni (figli, nipoti, vicini);</li>
<li>assistenza domiciliare privata oppure tramite il Servizio Sociale del Comune;</li>
<li>la teleassistenza per coprire <strong>le ore scoperte</strong>, che sono sempre le più pericolose: la notte, il primo pomeriggio dopo il turno di qualcuno.</li>
</ul>
<h2>Il punto cieco: le ore in cui il genitore è da solo</h2>
<blockquote>Nessuna organizzazione familiare copre 24 ore per 30 giorni. E le cadute post-dimissione hanno una caratteristica brutale: capitano proprio quando la persona è sola, di notte, al bagno, mentre gli altri sono fuori.</blockquote>
<p>Qui la tecnologia fa ciò che la rotazione dei familiari non può. Il bracciale eCura (dispositivo medico certificato Classe IIA):</p>
<ul>
<li><strong>rileva la caduta automaticamente</strong>, senza che il genitore debba premere nulla o chiamare, entro 3-5 secondi dal momento della caduta;</li>
<li>la <strong>Centrale Operativa H24</strong> chiama il genitore al polso entro 30 secondi e, se non risponde, allerta i soccorsi 118 con l''indirizzo esatto;</li>
<li>i <strong>familiari ricevono la notifica</strong> in tempo reale sull''app, ovunque si trovino;</li>
<li>monitora <strong>frequenza cardiaca e SpO2</strong> (piani Professional e Premium): utile nei giorni post-ricovero, quando le anomalie cardiache o respiratorie sono il secondo grande rischio oltre alla caduta; ogni misurazione finisce nelle <a href="/blog/analisi-report-servizio-premium/">analisi e report del servizio Premium</a>;</li>
<li>con l''<strong>AI predittiva</strong> (Premium) analizza i pattern comportamentali per segnalare situazioni di rischio prima che diventino cadute.</li>
</ul>
<div class="cta">
<div class="cta-title">🛡️ Bracciale eCura per il rientro dall''ospedale</div>
<p>Dispositivo medico Classe IIA · Rilevamento cadute automatico · Centrale H24 · Promemoria farmaci · Da €390/anno · Detraibile al 19% · Spedizione in 48 ore</p>
<a href="/#contattaci">Richiedi informazioni gratuite →</a>
</div>
<h2>Fonti e riferimenti</h2>
<ul>
<li>Quotidiano Sanità — <a href="https://www.quotidianosanita.it/scienza-e-farmaci/prevenire-le-cadute-degli-anziani-dopo-le-dimissioni-dall-ospedale/">Prevenire le cadute degli anziani dopo le dimissioni dall''ospedale</a>: circa il 14% dei pazienti viene riammesso entro 30 giorni.</li>
<li>Raccomandazioni ministeriali (NEJM 2003, 348:2269) — <a href="https://www.valoreinrsa.it/images/strumenti_di_lavoro/cadute/raccomandazioni/quadernoprevenzionedellecaduteweb.pdf">Quaderno sulla prevenzione delle cadute</a>: riduzione del 20% del rischio con interventi multifattoriali.</li>
<li>ISS, Epicentro — <a href="https://www.epicentro.iss.it/incidenti-domestici/rischi-cadute-anziani">Le cadute negli anziani</a>.</li>
</ul>
<h2>Domande frequenti</h2>
<details><summary>Quando è il momento giusto per attivare la teleassistenza: prima o dopo la dimissione?</summary><div><p>Prima, se possibile: l''attivazione è online e la spedizione arriva in 48 ore, quindi si può ordinare durante il ricovero e avere il bracciale operativo il giorno del rientro — esattamente quando il rischio inizia.</p></div></details>
<details><summary>Il genitore dice che si sente bene e non vuole il bracciale. Come si gestisce?</summary><div><p>È l''obiezione classica post-dimissione. Abbiamo dedicato un articolo alle <a href="/blog/convincere-genitore-anziano-bracciale/">strategie per convincere un genitore anziano</a>. In breve: partire dal rientro in autonomia a casa ("è ciò che ti permette di restare da solo"), usare la garanzia 30 giorni come prova senza impegno e coinvolgere il medico di base.</p></div></details>
<details><summary>La caduta viene rilevata anche se il genitore non preme il pulsante?</summary><div><p>Sì: il rilevamento è automatico, basato su un''AI addestrata su 14.000 cadute reali. Non occorre alcuna azione del genitore, che è il punto chiave nel periodo post-dimissione: le cadute spesso avvengono di notte o in stanze lontane. nel periodo post-dimissione, quando le cadute spesso avvengono di notte o in stanze lontane.</p></div></details>
<details><summary>Quanto costa e si può detrarre?</summary><div><p>I piani partono da €390/anno (Family Base). Essendo un dispositivo medico certificato, il costo è <a href="/blog/bracciale-anziani-detraibile-19-percento/">detraibile al 19%</a>; con disabilità riconosciuta Legge 104 si applica anche l''IVA al 4%.</p></div></details>
<details><summary>Serve per quanto tempo, poi si toglie?</summary><div><p>Dipende dal recupero: molte famiglie lo mantengono perché i benefici (farmaci, centrale H24, misurazioni) restano utili anche oltre la convalescenza. Non ci sono vincoli contrattuali oltre l''annuale.</p></div></details>
',
  'prevenzione-cadute-anziani-10-consigli',
  'Prevenzione Cadute Anziani: 10 consigli pratici per la casa',
  '10 interventi concreti per ridurre il rischio cadute: checklist stampabile.',
  'Prevenzione',
  'cadute-in-bagno-anziani-prevenzione',
  'Cadute in bagno: come rendere il bagno sicuro',
  'Perché il bagno è la stanza più pericolosa e come metterlo in sicurezza.',
  'Prevenzione',
  'polifarmacia-anziani-promemoria-farmaci',
  'Polifarmacia nell''anziano: rischi e promemoria',
  'Quando 5 farmaci al giorno diventano un rischio e come aiutare la famiglia.',
  'Salute',
  'published'
);
