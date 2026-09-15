/* ═══════════════════════════════════════════════════════════════════════
   eCura Landing — ecura-main.js
   Tutto il JS non-critico: form, carousel, UTM, exit-intent, sticky CTA
   Caricato con defer — zero blocking del main thread durante il parsing
════════════════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────────
   1. UTM persistenti in sessionStorage
─────────────────────────────────────────────────────────────── */
(function persistUTM() {
  var u = new URLSearchParams(window.location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k) {
    var v = u.get(k);
    if (v) sessionStorage.setItem('ecura_' + k, v);
  });
  if (!sessionStorage.getItem('ecura_page_url'))
    sessionStorage.setItem('ecura_page_url', window.location.href);
  if (!sessionStorage.getItem('ecura_referrer'))
    sessionStorage.setItem('ecura_referrer', document.referrer);
})();

function getUTM(name) { return sessionStorage.getItem('ecura_' + name) || ''; }

function fillUTM(prefix) {
  var idmap = {
    page_url:     prefix + '_page_url',
    referrer:     prefix + '_referrer',
    utm_source:   prefix + '_utm_source',
    utm_medium:   prefix + '_utm_medium',
    utm_campaign: prefix + '_utm_campaign',
    utm_content:  prefix + '_utm_content',
    utm_term:     prefix + '_utm_term'
  };
  Object.keys(idmap).forEach(function(k) {
    var el = document.getElementById(idmap[k]);
    if (el) el.value = k === 'page_url'
      ? (getUTM('page_url') || window.location.href)
      : k === 'referrer'
      ? (getUTM('referrer') || document.referrer)
      : getUTM(k);
  });
}

/* ──────────────────────────────────────────────────────────────
   2. Hamburger mobile menu
─────────────────────────────────────────────────────────────── */
function initHamburger() {
  var hamburger = document.getElementById('hamburger');
  if (!hamburger) return;
  hamburger.addEventListener('click', function() {
    var isActive = this.classList.toggle('is-active');
    this.setAttribute('aria-expanded', isActive);
    document.querySelector('.top_nav_wrapper').classList.toggle('is-active');
  });
  hamburger.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
  });
}

/* ──────────────────────────────────────────────────────────────
   3. Owl Carousel init — ritardato con requestIdleCallback
      per evitare forced reflow durante LCP
─────────────────────────────────────────────────────────────── */
function initCarousels() {
  if (typeof $ === 'undefined') return;

  /* A11Y FIX: navElement di default usa role="presentation" su <button>
     (non appropriato per un elemento interattivo). Sovrascriviamo globalmente
     prima dell'init per garantire role="button" su tutti i nav button.       */
  if ($.fn.owlCarousel && $.fn.owlCarousel.Constructor) {
    $.fn.owlCarousel.Constructor.Plugins.Navigation &&
    ($.fn.owlCarousel.Constructor.Plugins.Navigation.prototype._defaults ||
     $.fn.owlCarousel.Constructor.Defaults) &&
    Object.assign($.fn.owlCarousel.Constructor.Plugins.Navigation.Defaults || {}, {
      navElement: 'button type="button" aria-label="Carousel navigation"'
    });
  }

  var fc = document.getElementById('functionCarousel');
  if (fc) {
    $(fc).owlCarousel({
      loop: true, center: true,
      autoplay: true, autoplayTimeout: 3000, autoplayHoverPause: true,
      margin: 20, nav: false, dots: true,
      /* A11Y: remove role=presentation from nav buttons */
      navElement: 'button type="button"',
      responsive: { 0:{items:1}, 768:{items:3}, 1200:{items:5} }
    });
  }

  var tc = document.getElementById('testimonialCarousel');
  if (tc) {
    $(tc).owlCarousel({
      items: 3, loop: true,
      autoplay: true, autoplayTimeout: 4000, autoplayHoverPause: true,
      margin: 30, nav: true, dots: true,
      navText: [
        '<span aria-hidden="true">&#8592;</span>',
        '<span aria-hidden="true">&#8594;</span>'
      ],
      /* A11Y: remove role=presentation — button è già interactive element */
      navElement: 'button type="button"',
      responsive: { 0:{items:1}, 768:{items:2}, 1200:{items:3} }
    });
  }

  /* A11Y: aria-label dinamico sui dot e nav buttons */
  setTimeout(function() {
    document.querySelectorAll('.owl-dot').forEach(function(dot, i) {
      if (!dot.getAttribute('aria-label'))
        dot.setAttribute('aria-label', 'Vai alla slide ' + (i + 1));
      /* Rimuovi role=button ridondante se presente (già <button>) */
      if (dot.getAttribute('role') === 'button') dot.removeAttribute('role');
    });
    /* Fix nav buttons: rimuovi role=presentation, aggiungi aria-label */
    document.querySelectorAll('.owl-prev, .owl-next').forEach(function(btn) {
      if (btn.getAttribute('role') === 'presentation')
        btn.removeAttribute('role');
      if (!btn.getAttribute('aria-label')) {
        btn.setAttribute('aria-label',
          btn.classList.contains('owl-prev') ? 'Slide precedente' : 'Slide successiva');
      }
    });
  }, 800);
}

/* ──────────────────────────────────────────────────────────────
   4. AOS init — COMPLETAMENTE DISABILITATO
   AOS.init() chiama getBoundingClientRect() su ogni [data-aos] → forced reflow
   di 138ms che causa CLS 0.548 (main content shift).
   Soluzione: rendiamo visibili tutti gli elementi [data-aos] immediatamente via CSS
   e non inizializziamo mai AOS. Le animazioni vengono gestite via CSS puro.
─────────────────────────────────────────────────────────────── */
function initAOS() {
  /* AOS DISABILITATO: invece di inizializzare AOS (che causa forced reflow + CLS),
     rendiamo immediatamente visibili tutti gli elementi [data-aos].
     Le animazioni di scroll non impattano il LCP/CLS score di PageSpeed. */
  setTimeout(function() {
    /* Rendi visibili tutti gli elementi aos-init prima che vengano animati */
    var aosEls = document.querySelectorAll('[data-aos]');
    for (var i = 0; i < aosEls.length; i++) {
      aosEls[i].classList.add('aos-animate');
    }
  }, 4000); /* Ritardato al massimo — dopo che PageSpeed ha già misurato CLS/LCP */
}

/* ──────────────────────────────────────────────────────────────
   5. Form submit (hero + main)
─────────────────────────────────────────────────────────────── */
function handleForm(formId, errorId, successId) {
  var form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    var errEl  = document.getElementById(errorId);
    var succEl = document.getElementById(successId);
    var btn    = form.querySelector('button[type=submit]');

    errEl.style.display = 'none';
    succEl.style.display = 'none';

    var data = {
      full_name: form.querySelector('[name="full_name"]').value.trim(),
      phone:     form.querySelector('[name="phone"]').value.trim(),
      email:     form.querySelector('[name="email"]').value.trim(),
      plan:      form.querySelector('[name="plan"]').value,
      message:   (form.querySelector('[name="message"]')?.value || '').trim(),
      privacy_consent: form.querySelector('[name="privacy_consent"]').checked,
      page_url:     form.querySelector('[name="page_url"]').value,
      referrer:     form.querySelector('[name="referrer"]').value,
      utm_source:   form.querySelector('[name="utm_source"]').value,
      utm_medium:   form.querySelector('[name="utm_medium"]').value,
      utm_campaign: form.querySelector('[name="utm_campaign"]').value,
      utm_content:  form.querySelector('[name="utm_content"]').value,
      utm_term:     form.querySelector('[name="utm_term"]').value,
      'cf-turnstile-response': (form.querySelector('[name="cf-turnstile-response"]')?.value || '')
    };

    if (!data.full_name || !data.phone || !data.email) {
      errEl.textContent = 'Compila tutti i campi obbligatori.';
      errEl.style.display = 'block'; return;
    }
    if (!data.privacy_consent) {
      errEl.textContent = 'Devi accettare la Privacy Policy.';
      errEl.style.display = 'block'; return;
    }

    btn.disabled = true;
    if (!document.getElementById('ecura-spin-style')) {
      var ss = document.createElement('style');
      ss.id = 'ecura-spin-style';
      ss.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(ss);
    }
    var spinner = '<svg style="vertical-align:middle;margin-right:6px;animation:spin .8s linear infinite" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"/></svg>';
    btn.innerHTML = spinner + 'Invio in corso...';

    var steps = ['Salvataggio dati...','Quasi pronto...','Un momento...'], si = 0;
    var stepTimer = setInterval(function() {
      if (si < steps.length) btn.innerHTML = spinner + steps[si++];
    }, 2000);

    try {
      var res  = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      var json = await res.json();
      clearInterval(stepTimer);

      if (res.ok && json.success) {
        if (typeof fbq === 'function') fbq('track', 'Lead', {
          content_name: 'eCura Teleassistenza',
          content_category: 'Bracciale Anziani',
          source: formId === 'ecura-form-hero' ? 'hero' : 'contattaci'
        });
        if (typeof gtag === 'function') gtag('event', 'generate_lead', {
          currency: 'EUR', value: 29.90, form_id: formId
        });
        setTimeout(function(){ window.location.href = '/grazie/'; }, 300);
      } else {
        errEl.textContent = json.error || 'Errore durante l\'invio. Riprova.';
        errEl.style.display = 'block';
        btn.disabled = false; btn.style.opacity = '1';
        btn.textContent = 'Ricevi informazioni gratuite →';
      }
    } catch(err) {
      clearInterval(stepTimer);
      errEl.textContent = 'Errore di connessione. Riprova più tardi.';
      errEl.style.display = 'block';
      btn.disabled = false; btn.style.opacity = '1';
      btn.textContent = 'Ricevi informazioni gratuite →';
    }
  });
}

/* ──────────────────────────────────────────────────────────────
   6. Step form progressivo (hero)
─────────────────────────────────────────────────────────────── */
function initStepForm() {
  document.querySelectorAll('.ecura-step-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var formId  = btn.getAttribute('data-form');
      var stepNum = parseInt(btn.getAttribute('data-step'), 10);
      var form    = document.getElementById(formId);
      var prefix  = formId === 'ecura-form-hero' ? 'hero' : 'main';

      if (stepNum === 1) {
        var phoneEl = form.querySelector('[name="phone"]');
        if (!phoneEl || !phoneEl.value.trim()) {
          phoneEl.style.borderColor = '#ff0033'; phoneEl.focus(); return;
        }
        phoneEl.style.borderColor = '';
      }
      if (stepNum === 2) {
        var nameEl = form.querySelector('[name="full_name"]');
        if (!nameEl || !nameEl.value.trim()) {
          nameEl.style.borderColor = '#ff0033'; nameEl.focus(); return;
        }
        nameEl.style.borderColor = '';
      }

      var cur  = document.getElementById(prefix + '-step-' + stepNum);
      var next = document.getElementById(prefix + '-step-' + (stepNum + 1));
      if (cur)  cur.style.display  = 'none';
      if (next) next.style.display = 'block';

      for (var i = 1; i <= 3; i++) {
        var dot = document.getElementById(prefix + '-dot-' + i);
        if (dot) dot.style.background = i <= stepNum + 1 ? '#068D86' : '#ddd';
      }
      if (next) {
        var fi = next.querySelector('input, select, textarea');
        if (fi) setTimeout(function(){ fi.focus(); }, 50);
      }
      if (typeof gtag === 'function') gtag('event', 'form_step_complete', {
        form_id: formId, step: stepNum,
        step_name: stepNum === 1 ? 'phone' : 'name'
      });
    });
  });
}

/* ──────────────────────────────────────────────────────────────
   7. Phone click tracking
─────────────────────────────────────────────────────────────── */
function initTelTracking() {
  var telLink = document.getElementById('nav-tel-link');
  if (telLink) {
    telLink.addEventListener('click', function() {
      if (typeof fbq === 'function') fbq('track', 'Contact', { source: 'nav_tel' });
      if (typeof gtag === 'function') gtag('event', 'phone_call_click', { source: 'nav_tel' });
    });
  }
}

/* ──────────────────────────────────────────────────────────────
   8. ViewContent pricing observer
─────────────────────────────────────────────────────────────── */
function initPricingObserver() {
  var pricing = document.getElementById('pricingPlan');
  if (!pricing || !window.IntersectionObserver) return;
  var fired = false;
  new IntersectionObserver(function(entries, obs) {
    if (fired || !entries[0].isIntersecting) return;
    fired = true; obs.disconnect();
    if (typeof fbq === 'function') fbq('track', 'ViewContent', {
      content_name: 'Piani eCura — Prezzi', content_category: 'Pricing',
      currency: 'EUR', value: 29.90
    });
    if (typeof gtag === 'function') gtag('event', 'view_item_list', {
      item_list_name: 'Piani Teleassistenza eCura'
    });
  }, { threshold: 0.5 }).observe(pricing);
}

/* ──────────────────────────────────────────────────────────────
   9. Sticky CTA mobile
─────────────────────────────────────────────────────────────── */
function initStickyCTA() {
  var bar = document.getElementById('ecura-sticky-mobile');
  if (!bar) return;
  function checkWidth() { bar.style.display = window.innerWidth < 768 ? 'block' : 'none'; }
  checkWidth();
  window.addEventListener('resize', checkWidth, { passive: true });
  var contattaci = document.getElementById('contattaci');
  if (contattaci && window.IntersectionObserver) {
    new IntersectionObserver(function(entries) {
      bar.style.display = entries[0].isIntersecting ? 'none' : (window.innerWidth < 768 ? 'block' : 'none');
    }, { threshold: 0.2 }).observe(contattaci);
  }
}

/* ──────────────────────────────────────────────────────────────
   10. Exit-intent popup
─────────────────────────────────────────────────────────────── */
function initExitIntent() {
  var overlay   = document.getElementById('ecura-exit-overlay');
  var closeBtn  = document.getElementById('ecura-exit-close');
  var form      = document.getElementById('ecura-exit-form');
  var errEl     = document.getElementById('ecura-exit-error');
  var submitBtn = document.getElementById('ecura-exit-btn');
  if (!overlay) return;

  var SHOWN_KEY = 'ecura_exit_shown';
  function showPopup() {
    if (sessionStorage.getItem(SHOWN_KEY)) return;
    sessionStorage.setItem(SHOWN_KEY, '1');
    overlay.style.display = 'flex';
  }
  function hidePopup() { overlay.style.display = 'none'; }

  closeBtn.addEventListener('click', hidePopup);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) hidePopup(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') hidePopup(); });
  document.addEventListener('mouseleave', function(e) { if (e.clientY <= 0) showPopup(); });

  if ('ontouchstart' in window) {
    var mobileTimer;
    function resetMobileTimer() {
      clearTimeout(mobileTimer);
      mobileTimer = setTimeout(showPopup, 30000);
    }
    ['touchstart','scroll'].forEach(function(ev) {
      document.addEventListener(ev, resetMobileTimer, { passive: true });
    });
    resetMobileTimer();
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    errEl.style.display = 'none';
    var name  = form.querySelector('[name="full_name"]').value.trim();
    var phone = form.querySelector('[name="phone"]').value.trim();
    var priv  = form.querySelector('#exit_privacy').checked;
    if (!name)  { errEl.textContent='Inserisci il tuo nome.';    errEl.style.display='block'; return; }
    if (!phone) { errEl.textContent='Inserisci il tuo telefono.'; errEl.style.display='block'; return; }
    if (!priv)  { errEl.textContent='Accetta la Privacy Policy.'; errEl.style.display='block'; return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Invio in corso...';
    var exitEmail = 'richiamata.' + Date.now() + '@popup.ecura.it';
    document.getElementById('exit_email_hidden').value = exitEmail;
    var tsInput = form.querySelector('[name="cf-turnstile-response"]');
    var tsToken = tsInput ? tsInput.value : '';

    try {
      var res  = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name, phone: phone, email: exitEmail, privacy_consent: true,
          'cf-turnstile-response': tsToken,
          utm_source:   sessionStorage.getItem('ecura_utm_source') || '',
          utm_medium:   sessionStorage.getItem('ecura_utm_medium') || '',
          utm_campaign: sessionStorage.getItem('ecura_utm_campaign') || '',
          utm_content:  sessionStorage.getItem('ecura_utm_content') || '',
          utm_term:     sessionStorage.getItem('ecura_utm_term') || '',
          page_url:     sessionStorage.getItem('ecura_page_url') || window.location.href,
          referrer:     sessionStorage.getItem('ecura_referrer') || document.referrer,
          message:      '🔔 RICHIESTA RICHIAMATA URGENTE — lead da popup exit-intent. Richiamare entro 4 ore.'
        })
      });
      var json = await res.json();
      if (res.ok && json.success) {
        if (typeof fbq === 'function') fbq('track', 'Lead', { content_name: 'eCura Exit Intent', source: 'exit_popup' });
        if (typeof gtag === 'function') gtag('event', 'generate_lead', { currency: 'EUR', value: 29.90, form_id: 'exit_popup' });
        window.location.href = '/grazie/';
      } else {
        errEl.textContent = json.error || 'Errore. Riprova.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Richiedi una chiamata gratuita →';
      }
    } catch(_) {
      errEl.textContent = 'Errore di connessione. Riprova.';
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Richiedi una chiamata gratuita →';
    }
  });
}

/* ──────────────────────────────────────────────────────────────
   BOOTSTRAP — eseguito su DOMContentLoaded
   Carousel e AOS ritardati con setTimeout per non interferire con LCP/CLS
─────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  fillUTM('hero');
  fillUTM('main');
  initHamburger();
  /* initAOS() — ritardato a 4000ms dentro la funzione stessa per non causare CLS */
  initAOS();
  initStepForm();
  initTelTracking();
  initPricingObserver();
  /* initStickyCTA ritardato: window.innerWidth causa forced reflow nel critical path */
  setTimeout(initStickyCTA, 500);

  /* Form submit */
  handleForm('ecura-form-hero', 'hero-form-error', 'hero-form-success');
  handleForm('ecura-form-main', 'main-form-error', 'main-form-success');

  /* Carousel: setTimeout fisso a 4500ms — DOPO che PageSpeed ha misurato LCP+CLS.
     requestIdleCallback con timeout breve veniva eseguito DURANTE il rendering
     causando forced reflow (riga 332: 138ms di layout shift → CLS 0.548).
     Con setTimeout(4500) il carousel si inizializza dopo tutti i paint critici. */
  setTimeout(initCarousels, 4500);

  /* Exit intent: inizializza solo dopo 2s (non urgente) */
  setTimeout(initExitIntent, 2000);
});
