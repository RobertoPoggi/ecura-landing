/* ═══════════════════════════════════════════════════════════════════════
   eCura — gestione del consenso ai cookie e agli strumenti di misurazione
   - Nessun tracker viene caricato prima della scelta dell'utente.
   - Categorie: tecnici (sempre attivi), statistiche, marketing.
   - Google Consent Mode v2: default "denied"; GTM viene caricato solo se
     almeno una categoria è stata accettata.
   - Cookie di scelta: ecura_consent, 180 giorni, formato 1.s{0|1}.m{0|1}.{unix}
   - Revoca: link "Preferenze cookie" nel footer o window.ecuraConsent.open()
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var COOKIE = 'ecura_consent';
  var LEGACY = 'ecura_ck';          /* vecchio cookie a scelta unica: non più valido */
  var DAYS = 180;
  var GTM_ID = 'GTM-THW7H9NB';
  var AHREFS_KEY = 'WhJWRBjhU04P/qNCDss2XA';
  var PRIVACY_URL = '/privacy-policy/';

  /* ── Consent Mode v2: default negato prima di qualsiasi altro script ── */
  window.dataLayer = window.dataLayer || [];
  var gtmLoaded = false;
  function gtag() {
    /* gli eventi vengono accodati solo se GTM è stato autorizzato; i comandi
       "consent" passano sempre, così lo stato resta coerente */
    if (arguments[0] === 'consent' || gtmLoaded) window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  /* ── cookie di scelta ─────────────────────────────────────────────── */
  function readCookie(name) {
    var m = document.cookie.match('(?:^|;)\\s*' + name + '=([^;]+)');
    return m ? m[1] : null;
  }
  function secureFlag() { return location.protocol === 'https:' ? '; Secure' : ''; }
  function writeChoice(s, m) {
    var exp = new Date(); exp.setTime(exp.getTime() + DAYS * 864e5);
    document.cookie = COOKIE + '=1.s' + (s ? 1 : 0) + '.m' + (m ? 1 : 0) + '.' +
      Math.floor(Date.now() / 1000) + '; expires=' + exp.toUTCString() +
      '; path=/; SameSite=Lax' + secureFlag();
  }
  function dropLegacy() {
    if (readCookie(LEGACY) !== null)
      document.cookie = LEGACY + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  }
  function parse() {
    var v = readCookie(COOKIE);
    if (!v) return null;
    var p = v.split('.');
    if (p.length < 4 || p[0] !== '1') return null;
    var ts = parseInt(p[3], 10) || 0;
    if (ts && Date.now() / 1000 - ts > DAYS * 86400) return null;
    return { statistics: p[1] === 's1', marketing: p[2] === 'm1', ts: ts };
  }

  /* ── caricamento strumenti (solo dopo consenso) ───────────────────── */
  var gtmDone = false, ahrefsDone = false;
  function loadGTM() {
    if (gtmDone) return; gtmDone = true; gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }
  function loadAhrefs() {
    if (ahrefsDone) return; ahrefsDone = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://analytics.ahrefs.com/analytics.js';
    s.setAttribute('data-key', AHREFS_KEY);
    document.head.appendChild(s);
  }
  function clearTrackingCookies() {
    var host = location.hostname.replace(/^www\./, '');
    var domains = ['', 'domain=' + location.hostname + ';', 'domain=.' + host + ';'];
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (/^(_ga|_gid|_gat|_gcl_|_gac_|_dc_gtm|_fbp|_clck|_clsk)/.test(n)) {
        domains.forEach(function (d) {
          document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ' + d;
        });
      }
    });
  }

  /* ── applicazione della scelta ────────────────────────────────────── */
  var current = null, listeners = [];
  function apply(state, previous) {
    var s = !!state.statistics, m = !!state.marketing;
    gtag('consent', 'update', {
      analytics_storage: s ? 'granted' : 'denied',
      ad_storage: m ? 'granted' : 'denied',
      ad_user_data: m ? 'granted' : 'denied',
      ad_personalization: m ? 'granted' : 'denied'
    });
    if (s || m) loadGTM();
    if (s) loadAhrefs();
    current = state;
    try { window.dispatchEvent(new CustomEvent('ecura:consent', { detail: state })); } catch (e) {}
    listeners = listeners.filter(function (l) {
      if (state[l.cat]) { try { l.cb(); } catch (e) {} return false; }
      return true;
    });
    /* revoca: gli script già in esecuzione non si possono scaricare,
       quindi si cancellano i cookie e si ricarica la pagina */
    if (previous && ((previous.statistics && !s) || (previous.marketing && !m))) {
      clearTrackingCookies();
      location.reload();
    }
  }
  function save(s, m) {
    var previous = current;
    writeChoice(s, m);
    hideBanner();
    apply({ statistics: s, marketing: m, ts: Math.floor(Date.now() / 1000) }, previous);
  }

  /* ── interfaccia ──────────────────────────────────────────────────── */
  var banner = null;
  var CSS =
    '#ecck{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#fff;color:#3d3c3b;' +
    'border-top:3px solid #068d86;box-shadow:0 -6px 28px rgba(8,14,73,.16);font:400 14px/1.55 Roboto,-apple-system,"Segoe UI",Arial,sans-serif}' +
    '#ecck,#ecck *{font-family:Arial,Helvetica,sans-serif;font-weight:400}#ecck h2,#ecck button,#ecck strong{font-weight:700}' +
    '#ecck *{box-sizing:border-box}' +
    '#ecck .ecck-in{max-width:1100px;margin:0 auto;padding:18px 22px}' +
    '#ecck h2{font:700 16px/1.3 Arial,Helvetica,sans-serif;color:#080e49;margin:0 0 6px}' +
    '#ecck p{margin:0 0 12px;font-size:14px}' +
    '#ecck a{color:#0059c7;text-decoration:underline}' +
    '#ecck .ecck-btns{display:flex;gap:10px;flex-wrap:wrap}' +
    '#ecck button{font:700 14px/1 Arial,Helvetica,sans-serif;border-radius:6px;padding:12px 20px;min-height:44px;cursor:pointer;border:2px solid #080e49}' +
    '#ecck .ecck-acc{background:#080e49;color:#fff}' +
    '#ecck .ecck-rej{background:#080e49;color:#fff}' +
    '#ecck .ecck-cus{background:#fff;color:#080e49}' +
    '#ecck button:focus-visible{outline:3px solid #05b1a8;outline-offset:2px}' +
    '#ecck .ecck-cats{margin:4px 0 14px;display:grid;gap:10px}' +
    '#ecck label{display:flex;gap:10px;align-items:flex-start;font-size:14px;cursor:pointer}' +
    '#ecck label input{margin-top:3px;width:18px;height:18px;flex-shrink:0}' +
    '#ecck label small{display:block;color:#666;font-size:12.5px}' +
    '.ecck-prefs{text-align:center;font-size:.8rem;margin:10px 0 0;padding:0 12px}' +
    '.ecck-prefs a{color:inherit;text-decoration:underline;opacity:.85}' +
    '@media(max-width:640px){#ecck .ecck-btns{flex-direction:column}#ecck button{width:100%}}';

  function addStyle() {
    if (document.getElementById('ecck-style')) return;
    var st = document.createElement('style'); st.id = 'ecck-style'; st.textContent = CSS;
    document.head.appendChild(st);
  }
  function showBanner(openCustom) {
    addStyle();
    hideBanner();
    banner = document.createElement('div');
    banner.id = 'ecck';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Preferenze cookie');
    var c = current || { statistics: false, marketing: false };
    banner.innerHTML =
      '<div class="ecck-in">' +
      '<h2>La tua privacy</h2>' +
      '<p>Usiamo cookie tecnici necessari al funzionamento del sito. Con il tuo consenso usiamo anche strumenti di ' +
      'statistica (Google Analytics, Ahrefs Web Analytics) e di marketing (Google Ads) per misurare le visite e l\'efficacia ' +
      'delle campagne. Puoi accettare, rifiutare o scegliere, e cambiare idea in qualsiasi momento da «Preferenze cookie». ' +
      '<a href="' + PRIVACY_URL + '#cookie">Informativa privacy e cookie</a></p>' +
      '<div class="ecck-cats" hidden>' +
      '<label><input type="checkbox" checked disabled><span><strong>Tecnici</strong> (sempre attivi)' +
      '<small>Ricordano la tua scelta e proteggono i moduli dagli abusi.</small></span></label>' +
      '<label><input type="checkbox" id="ecck-s"' + (c.statistics ? ' checked' : '') + '><span><strong>Statistiche</strong>' +
      '<small>Google Analytics e Ahrefs Web Analytics: misurano come viene usato il sito.</small></span></label>' +
      '<label><input type="checkbox" id="ecck-m"' + (c.marketing ? ' checked' : '') + '><span><strong>Marketing</strong>' +
      '<small>Google Ads: misura le conversioni delle campagne pubblicitarie.</small></span></label>' +
      '</div>' +
      '<div class="ecck-btns">' +
      '<button type="button" class="ecck-acc" data-a="all">Accetta tutti</button>' +
      '<button type="button" class="ecck-rej" data-a="none">Rifiuta tutti</button>' +
      '<button type="button" class="ecck-cus" data-a="custom">Personalizza</button>' +
      '</div></div>';
    document.body.appendChild(banner);
    banner.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-a]') : null;
      if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'all') save(true, true);
      else if (a === 'none') save(false, false);
      else if (a === 'custom') {
        var cats = banner.querySelector('.ecck-cats');
        if (cats.hasAttribute('hidden')) {
          cats.removeAttribute('hidden');
          b.textContent = 'Salva le mie scelte';
          b.setAttribute('data-a', 'save');
        }
      } else if (a === 'save') {
        save(banner.querySelector('#ecck-s').checked, banner.querySelector('#ecck-m').checked);
      }
    });
    if (openCustom) {
      var cb = banner.querySelector('button[data-a="custom"]'); if (cb) cb.click();
    }
    var first = banner.querySelector('button'); if (first) first.focus({ preventScroll: true });
  }
  function hideBanner() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  /* link «Preferenze cookie» nel footer (aggiunto se la pagina non lo ha già) */
  function addFooterLink() {
    if (document.querySelector('[data-ecura-cookie-prefs]')) return;
    var f = document.querySelector('footer');
    if (!f) return;
    addStyle();
    var p = document.createElement('p');
    p.className = 'ecck-prefs';
    p.innerHTML = '<a href="#" data-ecura-cookie-prefs>Preferenze cookie</a>';
    f.appendChild(p);
  }

  /* ── API pubblica ─────────────────────────────────────────────────── */
  window.ecuraConsent = {
    open: function () { showBanner(true); },
    has: function (cat) { return !!(current && current[cat]); },
    get: function () { return current; },
    /* esegue cb subito se la categoria è già accettata, altrimenti alla prima accettazione */
    when: function (cat, cb) {
      if (current && current[cat]) { try { cb(); } catch (e) {} }
      else listeners.push({ cat: cat, cb: cb });
    }
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-ecura-cookie-prefs]') : null;
    if (a) { e.preventDefault(); showBanner(true); }
  });

  /* ── avvio ────────────────────────────────────────────────────────── */
  dropLegacy();
  var saved = parse();
  if (saved) apply(saved, null);

  function ready() {
    addFooterLink();
    if (!saved) showBanner(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
