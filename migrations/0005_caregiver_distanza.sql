-- Migration 0005: Insert article #13 — Caregiver a Distanza
-- This registers the article in D1 so the blog/[slug].js Worker serves it.

INSERT OR IGNORE INTO blog_articles (
  slug, title, description, category, tag_color, author,
  date_published, date_modified, read_time,
  hero_image, hero_image_alt, summary, content,
  related_1_slug, related_1_title, related_1_excerpt, related_1_tag,
  related_2_slug, related_2_title, related_2_excerpt, related_2_tag,
  related_3_slug, related_3_title, related_3_excerpt, related_3_tag,
  status
) VALUES (
  'caregiver-distanza-genitori-anziani-estero',
  'Caregiver a Distanza: come assistere i genitori anziani dall''estero nel 2026',
  'Vivi in UK, Germania, Svizzera o Spagna e i tuoi genitori sono soli in Italia? Scopri come eCura ti permette di fare il caregiver a distanza: GPS, cadute, app familiare, centrale H24, SIM internazionale multi-provider UE+ inclusa.',
  'Famiglia & Distanza',
  '#068D86',
  'Redazione eCura',
  '2026-09-25',
  '2026-09-25',
  '10 min lettura',
  '/img/hero-lg.jpg',
  'Figlio che monitora i genitori anziani dall''estero con l''app eCura',
  'Oltre 5 milioni di italiani vivono stabilmente all''estero con genitori anziani soli in Italia. eCura permette di fare il caregiver a distanza: GPS, notifiche caduta, Centrale H24, SIM internazionale multi-provider UE+ inclusa senza costi extra.',
  '<div class="callout">
    <strong>In sintesi</strong>
    <p>Oltre 5 milioni di italiani vivono stabilmente all''estero. Molti hanno genitori anziani soli in Italia. eCura permette a un figlio a Londra, Berlino, Zurigo o Amsterdam di essere il caregiver del proprio genitore in tempo reale &mdash; con notifiche caduta, GPS, parametri vitali e una Centrale Operativa H24 che interviene fisicamente in Italia quando serve.</p>
  </div>

  <h2>Un problema che riguarda milioni di famiglie italiane</h2>
  <p>Secondo i dati AIRE (Anagrafe Italiani Residenti all''Estero), oltre <strong>5,3 milioni di cittadini italiani</strong> vivono stabilmente fuori dall''Italia. La maggior parte ha lasciato il paese tra i 25 e i 40 anni per lavoro, e si ritrova oggi con genitori che invecchiano &mdash; soli, in Italia &mdash; mentre loro sono a migliaia di chilometri di distanza.</p>
  <p>Le mete più comuni: <strong>Regno Unito, Germania, Svizzera, Francia, Spagna, Olanda, Belgio, Portogallo, Australia, Canada</strong>. La domanda che accomuna tutti questi figli è sempre la stessa: <em>"Come faccio a sapere che mia madre sta bene, se non posso esserci?"</em></p>
  <p>Non si tratta solo di preoccupazione emotiva. Una caduta in casa non rilevata in tempo può costare la vita. Una crisi notturna senza nessuno vicino può diventare una tragedia. La distanza fisica non cancella la responsabilità morale del caregiver familiare &mdash; ma fino a oggi rendeva quella responsabilità quasi impossibile da esercitare davvero.</p>

  <h2>Il doppio scenario: chi è lontano e chi è rimasto</h2>
  <p>La situazione delle famiglie italiane divise dalla distanza si presenta in due forme principali:</p>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:24px 0" class="scenario-grid">
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px">
      <p style="font-size:1.3rem;margin:0 0 8px">✈️</p>
      <h3 style="font-size:1rem;color:#080E49;margin:0 0 10px">Figlio all''estero, genitore in Italia</h3>
      <p style="font-size:.9rem;color:#374151;margin:0">Il caso più comune. Il figlio lavora a Londra, Monaco, Zurigo o Parigi. Il genitore &mdash; spesso la madre vedova &mdash; vive da solo nell''appartamento di sempre, in Italia. Il figlio torna una o due volte l''anno e nel frattempo vive con l''ansia.</p>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px">
      <p style="font-size:1.3rem;margin:0 0 8px">🌴</p>
      <h3 style="font-size:1rem;color:#080E49;margin:0 0 10px">Genitore in pensione all''estero, figlio in Italia</h3>
      <p style="font-size:.9rem;color:#374151;margin:0">Un fenomeno in crescita: anziani italiani che scelgono Portogallo, Svizzera, Spagna o Grecia per la pensione, attratti dal costo della vita o dal clima. I figli rimangono in Italia e si preoccupano a distanza inversa.</p>
    </div>
  </div>

  <p>In entrambi i casi, il fattore comune è la distanza fisica e la necessità di avere un sistema che garantisca sicurezza e monitoraggio <strong>senza richiedere la presenza costante del familiare</strong>.</p>

  <h2>Cosa può fare concretamente eCura per un caregiver a distanza</h2>
  <p>eCura è stato progettato anche pensando a questo scenario. L''app familiare è lo strumento che trasforma uno smartphone &mdash; ovunque nel mondo &mdash; in un pannello di controllo per il benessere del genitore in Italia.</p>

  <h3>1. Posizione GPS in tempo reale</h3>
  <p>Dal proprio telefono, il figlio a Londra vede su mappa dove si trova il genitore in questo momento: se è in casa, se è uscito a fare la spesa, se è ancora dal medico. Il GPS di eCura funziona sia all''aperto (GNSS) che al chiuso (Wi-Fi positioning), senza punti ciechi. <strong>Non occorre che il genitore faccia nulla</strong>: il bracciale comunica autonomamente via SIM internazionale inclusa nel servizio.</p>

  <div class="callout" style="background:#eff6ff;border-left-color:#3b82f6">
    <strong>📡 SIM internazionale multi-provider &mdash; inclusa, senza costi extra</strong>
    <p>Il bracciale eCura non usa una SIM italiana ordinaria. Monta una <strong>SIM internazionale multi-provider</strong> che seleziona automaticamente il miglior operatore disponibile in ogni paese. Funziona senza interruzioni in tutta l''Unione Europea e nei principali paesi extra-UE (Svizzera, UK, ecc.). Nessun roaming, nessun cambio di SIM, nessun costo aggiuntivo rispetto al canone annuale. Il genitore può spostarsi tra Italia, Portogallo, Spagna, Svizzera o qualsiasi altro paese coperto: la connessione alla Centrale H24 e all''app dei familiari rimane attiva senza fare nulla.</p>
  </div>

  <h3>2. Notifica caduta automatica &mdash; senza premere nulla</h3>
  <p>È il momento più critico per un caregiver a distanza. Se il genitore cade in casa di notte &mdash; nello scenario peggiore &mdash; chi interviene?</p>
  <p>Il bracciale eCura rileva la caduta automaticamente tramite un algoritmo AI addestrato su oltre <strong>14.000 cadute documentate</strong>. Non occorre premere il pulsante SOS: il sistema riconosce il pattern della caduta e avvia automaticamente la procedura di emergenza. Entro 30 secondi, se il genitore non risponde, la <strong>Centrale Operativa H24</strong> lo chiama direttamente al polso &mdash; e se necessario attiva i soccorsi in Italia. Il figlio a Londra riceve una notifica push sull''app in tempo reale.</p>

  <h3>3. Parametri vitali: frequenza cardiaca e SpO2</h3>
  <p>Nei piani Professional e Premium, il bracciale monitora continuamente la frequenza cardiaca e la saturazione dell''ossigeno nel sangue (SpO2). Anomalie rilevanti attivano notifiche immediate sull''app dei familiari. Utile in particolare per genitori con patologie cardiovascolari o respiratorie note.</p>

  <h3>4. Promemoria farmaci</h3>
  <p>Il bracciale vibra all''orario programmato per ricordare al genitore di prendere i farmaci. Il figlio può impostare e modificare i promemoria direttamente dall''app, da qualsiasi paese. La conferma di avvenuta assunzione è visibile nell''app.</p>

  <h3>5. Comunicazione diretta al polso</h3>
  <p>Attraverso l''app, il figlio può chiamare il genitore direttamente al bracciale: non occorre che l''anziano abbia uno smartphone, che lo cerchi, che risponda a un numero. Il bracciale squilla al polso e il genitore risponde con un tocco. Una comunicazione semplice, pensata per chi non è a suo agio con la tecnologia.</p>

  <h3>6. La Centrale Operativa H24: il "presidio fisico" che il figlio non può garantire</h3>
  <p>È il pezzo del puzzle che fa la differenza quando si vive lontani. I piani <em>Avanzato</em> di eCura includono la <strong>Centrale Operativa H24</strong> con operatori italiani disponibili 24 ore su 24, 7 giorni su 7, 365 giorni l''anno. In caso di emergenza:</p>
  <ul>
    <li>La Centrale chiama il genitore direttamente al bracciale</li>
    <li>Se non risponde, allerta i familiari nell''app</li>
    <li>Se necessario, invia i soccorsi all''indirizzo del genitore in Italia</li>
    <li>Gestisce l''emergenza anche se il figlio è irraggiungibile (diverso fuso orario, al lavoro, ecc.)</li>
  </ul>
  <p>Per un figlio a Sydney o a New York, questo significa poter dormire tranquillo sapendo che c''è qualcuno &mdash; in Italia &mdash; che veglia sul genitore in sua vece.</p>

  <h2>Quanti familiari possono monitorare lo stesso genitore</h2>
  <p>L''app eCura per familiari è installabile su <strong>più dispositivi contemporaneamente</strong>, senza costi aggiuntivi. Se ci sono tre figli &mdash; uno a Londra, uno a Milano, uno a Berlino &mdash; tutti e tre ricevono le stesse notifiche, vedono la stessa posizione GPS, possono chiamare il genitore al bracciale. Non c''è un solo "caregiver principale": la responsabilità è distribuita tra tutti i familiari, ognuno dal proprio telefono, ovunque nel mondo.</p>

  <h2>Il caso dei genitori italiani in pensione all''estero</h2>
  <p>Un numero crescente di pensionati italiani sceglie di trascorrere gli anni della pensione all''estero: il <strong>Portogallo</strong> (Lisbona, Algarve) per il clima e il costo della vita, la <strong>Svizzera</strong> per ragioni familiari, la <strong>Spagna</strong> (Canarie, Costa Brava), la <strong>Grecia</strong>. I figli restano in Italia e si trovano nella situazione speculare: sono loro a essere "rimasti", mentre il genitore è lontano.</p>
  <p>Per questo scenario, eCura è attivabile con contratto italiano. Si consiglia di <a href="/#pricingPlan">contattare il team eCura</a> per verificare la copertura della SIM 4G nel paese di residenza del genitore e valutare la soluzione più adatta.</p>

  <h2>I piani eCura per caregivers a distanza</h2>
  <table class="comp-table">
    <thead>
      <tr>
        <th>Piano</th>
        <th>Prezzo</th>
        <th>GPS</th>
        <th>Cadute auto</th>
        <th>Centrale H24</th>
        <th>Parametri vitali</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Family Base</strong></td>
        <td>€390/anno<br><small style="color:#6b7280">(€32,50/mese)</small></td>
        <td>✅ outdoor</td>
        <td>✅</td>
        <td>❌</td>
        <td>❌</td>
      </tr>
      <tr style="background:#f0fdf4">
        <td><strong>Family Avanzato</strong> ⭐</td>
        <td>€690/anno<br><small style="color:#6b7280">(€57,50/mese)</small></td>
        <td>✅ outdoor</td>
        <td>✅</td>
        <td>✅ H24</td>
        <td>❌</td>
      </tr>
      <tr>
        <td><strong>Professional Avanzato</strong></td>
        <td>€840/anno<br><small style="color:#6b7280">(€70/mese)</small></td>
        <td>✅ indoor+outdoor</td>
        <td>✅</td>
        <td>✅ H24</td>
        <td>✅ HR+SpO2</td>
      </tr>
      <tr>
        <td><strong>Premium Avanzato</strong></td>
        <td>€990/anno<br><small style="color:#6b7280">(€82,50/mese)</small></td>
        <td>✅ indoor+outdoor</td>
        <td>✅ AI avanzato</td>
        <td>✅ H24</td>
        <td>✅ avanzati + AI</td>
      </tr>
    </tbody>
  </table>
  <p style="font-size:.85rem;color:#6b7280;margin-top:8px">⭐ Il piano consigliato per i caregivers a distanza è <strong>Family Avanzato</strong>: include la Centrale H24 che interviene fisicamente in Italia, a €57,50/mese. Con detrazione IRPEF 19%: costo netto €46,58/mese.</p>

  <h2>La detraibilità al 19%: chi può scaricarla</h2>
  <p>eCura è l''unico bracciale per anziani in Italia certificato <strong>dispositivo medico Classe IIA</strong> (BD/RDM 2853300) ai sensi del Regolamento UE MDR 2017/745. Questo lo rende detraibile al 19% come spesa sanitaria nella dichiarazione dei redditi italiana.</p>
  <p>Per i figli residenti all''estero che non presentano dichiarazione in Italia: è possibile <strong>intestare il contratto al genitore</strong> residente in Italia, che può detrarre la spesa nella propria dichiarazione dei redditi (modello 730 o Unico). In alternativa, il figlio residente all''estero ma con redditi imponibili in Italia può detrarre la spesa nel proprio modello Unico. Per approfondimenti: <a href="/bracciale-anziani-detraibile/">Bracciale anziani detraibile al 19%</a>.</p>

  <h2>Come attivare eCura da un paese estero</h2>
  <p>L''attivazione è completamente online. Il figlio all''estero può:</p>
  <ol>
    <li>Scegliere il piano su <strong>www.ecura.it</strong> e completare l''ordine online</li>
    <li>Indicare l''indirizzo di spedizione del genitore in Italia</li>
    <li>Scaricare l''app eCura sul proprio smartphone (iOS o Android) ovunque si trovi</li>
    <li>Il genitore riceve il bracciale a casa: la configurazione guidata è semplice e il team eCura supporta il genitore telefonicamente se necessario</li>
  </ol>
  <p>Non è necessario essere fisicamente presenti in Italia per attivare il servizio.</p>

  <div class="callout" style="background:#fef3c7;border-left-color:#f59e0b">
    <strong>Lo sapevi?</strong>
    <p>Tra i clienti eCura ci sono già famiglie con figli in <strong>Inghilterra, Germania, Olanda, Belgio, Spagna, Francia e Svizzera</strong> che monitorano quotidianamente i propri genitori in Italia. La notifica di caduta è arrivata a figli a Londra e a Zurigo: la Centrale H24 era già intervenuta prima che il figlio riuscisse a richiamare.</p>
  </div>

  <h2>Domande frequenti</h2>

  <details style="border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin-bottom:10px">
    <summary style="font-weight:600;cursor:pointer;color:#080E49">Devo essere in Italia per installare e configurare il bracciale?</summary>
    <p style="margin-top:10px;color:#374151">No. Il bracciale viene spedito direttamente al genitore in Italia. La configurazione dell''app familiare si fa sullo smartphone del figlio, ovunque si trovi. Il team eCura supporta telefonicamente il genitore per la configurazione del bracciale se necessario.</p>
  </details>

  <details style="border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin-bottom:10px">
    <summary style="font-weight:600;cursor:pointer;color:#080E49">Il bracciale ha bisogno del Wi-Fi di casa del genitore?</summary>
    <p style="margin-top:10px;color:#374151">No. Il bracciale eCura ha una <strong>SIM internazionale multi-provider inclusa nel canone annuale</strong>. Comunica autonomamente con la Centrale H24 e con l''app dei familiari senza bisogno di Wi-Fi, smartphone o intervento del genitore. La SIM funziona in Italia e in tutti i paesi UE+ (UK, Svizzera, Portogallo, Spagna, Francia, Germania, ecc.) senza costi aggiuntivi: seleziona automaticamente l''operatore disponibile con il segnale migliore. Il Wi-Fi di casa viene utilizzato solo per il posizionamento indoor, non per la connettività.</p>
  </details>

  <details style="border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin-bottom:10px">
    <summary style="font-weight:600;cursor:pointer;color:#080E49">Cosa succede se sono in un fuso orario diverso e c''è un''emergenza di notte (mia notte)?</summary>
    <p style="margin-top:10px;color:#374151">La Centrale Operativa H24 è attiva 24 ore su 24, 7 giorni su 7, 365 giorni l''anno &mdash; indipendentemente dall''orario dei familiari. Gestisce autonomamente l''emergenza in Italia (chiamata al genitore, allerta soccorsi) e notifica i familiari sull''app. Il figlio a Sydney o a New York viene avvisato, ma non è necessario che risponda immediatamente: la Centrale ha già gestito la situazione.</p>
  </details>

  <details style="border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin-bottom:10px">
    <summary style="font-weight:600;cursor:pointer;color:#080E49">La batteria dura quanto? Devo ricaricarla io ogni giorno?</summary>
    <p style="margin-top:10px;color:#374151">La batteria dura <strong>oltre 48 ore</strong> con GPS attivo e monitoraggio continuo. La ricarica avviene tramite un comodo supporto magnetico (senza cavi da inserire): basta appoggiare il bracciale sul supporto. La ricarica completa richiede circa 2 ore. Il figlio può monitorare il livello di batteria direttamente dall''app.</p>
  </details>

  <details style="border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin-bottom:10px">
    <summary style="font-weight:600;cursor:pointer;color:#080E49">Il bracciale è adatto a genitori poco abituati alla tecnologia?</summary>
    <p style="margin-top:10px;color:#374151">È stato progettato proprio per questo. Il genitore non deve fare nulla di speciale: indossa il bracciale come un orologio normale. Il SOS si attiva con un tasto fisico grande. Le cadute vengono rilevate in automatico. Non occorre interagire con app, menu o impostazioni: è tutto trasparente per l''anziano.</p>
  </details>',
  'badante-vs-teleassistenza-costi-2026',
  'Badante vs Teleassistenza: costi a confronto',
  'Quando basta il bracciale e quando serve la badante.',
  'Confronto',
  'teleassistenza-anziani-come-funziona-costi',
  'Teleassistenza: come funziona e quanto costa',
  'Centrale H24, costi reali e come dedurli fiscalmente.',
  'Informazione',
  'anziano-solo-casa-soluzioni-sicurezza',
  'Anziano solo in casa: le migliori soluzioni',
  'Tecnologie, abitudini e consigli pratici per la sicurezza.',
  'Sicurezza',
  'published'
);
