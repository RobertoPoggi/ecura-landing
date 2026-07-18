/* ═══════════════════════════════════════════════
   eCura Landing — main.js
   Form submit, UTM tracking, UI helpers
════════════════════════════════════════════════ */

// ─── Config ───────────────────────────────────
const CRM_ENDPOINT = '/api/submit-lead'

// ─── Init AOS ─────────────────────────────────
AOS.init({ once: true, offset: 60 })

// ─── UTM helpers ──────────────────────────────
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name) || ''
}

function injectUTMs(prefix) {
  const fields = ['page_url','referrer','utm_source','utm_medium','utm_campaign','utm_content','utm_term']
  const values = {
    page_url:     window.location.href,
    referrer:     document.referrer,
    utm_source:   getParam('utm_source'),
    utm_medium:   getParam('utm_medium'),
    utm_campaign: getParam('utm_campaign'),
    utm_content:  getParam('utm_content'),
    utm_term:     getParam('utm_term'),
  }
  fields.forEach(f => {
    const el = document.getElementById(`${prefix}_${f}`)
    if (el) el.value = values[f]
  })
}

injectUTMs('hero')
injectUTMs('main')

// ─── Mobile menu ──────────────────────────────
const hamburger = document.getElementById('hamburger')
const mobileMenu = document.getElementById('mobileMenu')

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('d-none')
  })
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.add('d-none'))
  })
}

// ─── Set plan from pricing buttons ────────────
window.setFormPlan = function(plan) {
  const sel = document.getElementById('main_plan')
  if (sel) {
    // Trova l'opzione più vicina al piano selezionato
    for (let o of sel.options) {
      if (o.value.toLowerCase().includes(plan.toLowerCase())) {
        sel.value = o.value
        break
      }
    }
  }
}

// ─── Form validation & submit ─────────────────
function validateForm(form) {
  let valid = true

  // Reset previous errors
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'))

  // full_name
  const name = form.querySelector('[name="full_name"]')
  if (name && !name.value.trim()) {
    name.classList.add('is-invalid')
    valid = false
  }

  // phone
  const phone = form.querySelector('[name="phone"]')
  if (phone && !phone.value.trim()) {
    phone.classList.add('is-invalid')
    valid = false
  }

  // email
  const email = form.querySelector('[name="email"]')
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
      email.classList.add('is-invalid')
      valid = false
    }
  }

  // privacy_consent
  const privacy = form.querySelector('[name="privacy_consent"]')
  if (privacy && !privacy.checked) {
    privacy.classList.add('is-invalid')
    valid = false
  }

  return valid
}

function buildPayload(form) {
  const data = new FormData(form)
  const payload = {}
  data.forEach((val, key) => {
    if (key === 'privacy_consent' || key === 'marketing_consent') {
      payload[key] = form.querySelector(`[name="${key}"]`)?.checked || false
    } else {
      payload[key] = val
    }
  })
  // Aggiungi source fisso
  payload.source = 'ecura_landing'
  payload.pipeline = 'Landing eCura'
  payload.status = 'new'
  return payload
}

function setLoading(form, loading) {
  const btn = form.querySelector('button[type="submit"]')
  if (!btn) return
  btn.disabled = loading
  btn.querySelector('.btn-text')?.classList.toggle('d-none', loading)
  btn.querySelector('.btn-loading')?.classList.toggle('d-none', !loading)
}

function showSuccess(form) {
  form.querySelectorAll('.mb-3, .mb-4, .row').forEach(el => el.style.display = 'none')
  form.querySelector('button[type="submit"]').style.display = 'none'
  form.querySelector('.form-success').classList.remove('d-none')
}

function showError(form, msg) {
  const errEl = form.querySelector('.form-error')
  const msgEl = form.querySelector('.error-msg')
  if (msgEl) msgEl.textContent = msg || 'Si è verificato un errore. Riprova.'
  errEl?.classList.remove('d-none')
}

async function submitForm(form) {
  if (!validateForm(form)) return

  // Controlla Turnstile token
  const turnstileInput = form.querySelector('[name="cf-turnstile-response"]')
  if (turnstileInput && !turnstileInput.value) {
    showError(form, 'Completa la verifica di sicurezza.')
    return
  }

  setLoading(form, true)
  form.querySelector('.form-error')?.classList.add('d-none')

  try {
    const payload = buildPayload(form)
    const res = await fetch(CRM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (res.ok && data.success) {
      showSuccess(form)
      // Tracking evento
      if (window.dataLayer) {
        window.dataLayer.push({ event: 'lead_submitted', plan: payload.plan || '' })
      }
    } else {
      showError(form, data.error || 'Errore durante l\'invio. Riprova.')
      setLoading(form, false)
    }
  } catch (e) {
    showError(form, 'Errore di rete. Controlla la connessione e riprova.')
    setLoading(form, false)
  }
}

// Attacca handler a tutti i form .ecura-form
document.querySelectorAll('.ecura-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault()
    submitForm(form)
  })
})

// ─── Smooth scroll per anchor links ───────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'))
    if (target) {
      e.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
})

// ─── Sticky nav highlight ─────────────────────
const sections = document.querySelectorAll('section[id]')
const navLinks = document.querySelectorAll('.top_Menu a')

window.addEventListener('scroll', () => {
  let current = ''
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) current = section.id
  })
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`)
  })
}, { passive: true })
