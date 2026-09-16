/**
 * Cloudflare Pages Function — POST /api/register-partner
 *
 * Registra una nuova richiesta di partnership eCura:
 *   1. Valida i dati del form
 *   2. Verifica Cloudflare Turnstile (anti-bot)
 *   3. Salva il partner come LEAD nel CRM TeleMedCare (/api/leads/public)
 *      con fonte = "FORM PARTNER" — stessa pipeline dei lead normali.
 *      Il partner potrà in futuro acquistare servizi come demo.
 *
 * NOTA REFERRAL: Il dataset PARTNERS rimane intatto per la gestione
 *   del programma di referral (/api/partners/referral/*).
 *   I partner vengono attivati manualmente dall'admin nel CRM.
 *
 * ENV VARS richieste:
 *   TURNSTILE_SECRET_KEY  — secret Cloudflare Turnstile
 *   CRM_BASE_URL          — URL base CRM (default: https://telemedcare-v12.pages.dev)
 *   CRM_API_KEY           — opzionale, LANDING_API_KEY del CRM
 *   GSHEET_WEBHOOK_URL    — Google Apps Script webhook (opzionale)
 *   CORS_ORIGIN           — es. https://www.ecura.it
 */

export async function onRequestPost({ request, env, waitUntil }) {

  // ── CORS ──────────────────────────────────────
  const corsOrigin = env.CORS_ORIGIN || '*'
  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  // ── Parse body ────────────────────────────────
  let body
  try {
    body = await request.json()
  } catch {
    return json({ success: false, error: 'Richiesta non valida' }, 400, corsHeaders)
  }

  const {
    full_name, phone, email, role,
    city = '', message = '',
    privacy_consent,
    'cf-turnstile-response': turnstileToken = '',
    utm_source = '', utm_medium = '', utm_campaign = '',
    page_url = '', referrer = '',
  } = body

  // ── Validazione campi obbligatori ─────────────
  if (!full_name?.trim())
    return json({ success: false, error: 'Nome e cognome obbligatori' }, 422, corsHeaders)
  if (!phone?.trim())
    return json({ success: false, error: 'Telefono obbligatorio' }, 422, corsHeaders)
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return json({ success: false, error: 'Email non valida' }, 422, corsHeaders)
  if (!role?.trim())
    return json({ success: false, error: 'Professione/Ruolo obbligatorio' }, 422, corsHeaders)
  if (!privacy_consent)
    return json({ success: false, error: 'Devi accettare la Privacy Policy' }, 422, corsHeaders)

  // ── Cloudflare Turnstile — verifica anti-bot ──
  const turnstileSecret = env.TURNSTILE_SECRET_KEY || ''
  if (turnstileSecret) {
    const cfIp = request.headers.get('CF-Connecting-IP') || ''
    let verifyData
    try {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken, remoteip: cfIp }),
      })
      verifyData = await verifyRes.json()
    } catch (e) {
      console.error('[register-partner] Turnstile fetch error:', e)
      verifyData = { success: false }
    }
    if (!verifyData.success) {
      const errCode = (verifyData['error-codes'] || []).join(',')
      console.warn('[register-partner] Turnstile failed:', errCode)
      return json({
        success: false,
        error: 'Verifica di sicurezza fallita. Ricarica la pagina e riprova.',
        _debug: errCode
      }, 400, corsHeaders)
    }
  }

  const emailNorm    = email.trim().toLowerCase()
  const nameParts    = full_name.trim().split(/\s+/)
  const nomeField    = nameParts[0] || full_name.trim()
  const cognomeField = nameParts.slice(1).join(' ') || ''

  // Costruisci la nota combinando ruolo + eventuale messaggio
  const noteField = message?.trim()
    ? `[Partner] Ruolo: ${role.trim()} | ${message.trim()}`
    : `[Partner] Ruolo: ${role.trim()}`

  // ── Salva come LEAD nel CRM con fonte "FORM PARTNER" ──────────────────────
  const crmBase   = (env.CRM_BASE_URL || 'https://telemedcare-v12.pages.dev').replace(/\/$/, '')
  const crmApiKey = env.CRM_API_KEY || ''

  const leadPayload = {
    nomeRichiedente:    nomeField,
    cognomeRichiedente: cognomeField,
    email:              emailNorm,
    telefono:           phone.trim(),
    servizio:           'eCura PRO',
    piano:              'BASE',
    fonte:              'FORM PARTNER',          // whitelist in /api/leads/public
    dettaglio_fonte:    'ecura_partner_page',
    note:               noteField,
    gdprConsent:        true,
    consensoMarketing:  false,
    canale_acquisizione: city?.trim() || null,   // usiamo canale per la città
    utm_source:          utm_source   || null,
    utm_medium:          utm_medium   || null,
    utm_campaign:        utm_campaign || null,
    page_url:            page_url     || 'https://www.ecura.it/partner/',
  }

  let crmResult = { success: false, id: null, duplicate: false }
  let crmOk = false

  try {
    const crmRes = await fetch(`${crmBase}/api/leads/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(crmApiKey ? { 'X-API-Key': crmApiKey } : {}),
      },
      body: JSON.stringify(leadPayload),
    })

    if (crmRes.ok) {
      crmResult = await crmRes.json()
      crmOk = true
      console.log(`[register-partner] ✅ Partner salvato come lead: ${emailNorm} → ${crmResult.id || 'new'}`)
    } else {
      const errText = await crmRes.text().catch(() => 'unknown')
      console.error(`[register-partner] CRM error ${crmRes.status}:`, errText)
    }
  } catch (e) {
    console.error('[register-partner] CRM fetch error:', e)
  }

  // ── Notifica Google Sheet ─────────────────────────────────────────────────
  // STRATEGIA FALLBACK:
  //   - Se CRM ok  → GSheet fire-and-forget (waitUntil), non blocca risposta
  //   - Se CRM KO  → GSheet in ATTESA (await): salvataggio garantito nel foglio
  //                  così il dato viene importato manualmente quando il CRM torna online
  const gsheetBase = env.GSHEET_WEBHOOK_URL || ''
  if (gsheetBase) {
    const dataOra = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })
    const qs = new URLSearchParams({
      key:          'ecura-import-2026',
      action:       'write',
      data_ora:     dataOra,
      email:        emailNorm,
      nome:         nomeField,
      cognome:      cognomeField,
      telefono:     phone.trim(),
      citta:        city.trim(),
      servizio:     'eCura PRO',
      piano:        'BASE',
      fonte:        'FORM PARTNER',
      canale:       utm_source ? 'REFERRAL' : 'ORGANICO',
      utm_source:   utm_source   || '',
      utm_medium:   utm_medium   || '',
      utm_campaign: utm_campaign || 'partner_program',
      page_url:     page_url     || '',
      referrer:     referrer     || '',
      landing:      'partner',
      note:         noteField,
      lead_id:      crmResult.id || '',
    }).toString()

    const gsheetUrl = `${gsheetBase}?${qs}`

    if (crmOk) {
      // CRM ok: GSheet in background, non rallentiamo la risposta
      const gsPromise = fetch(gsheetUrl, { method: 'GET' })
        .then(r => console.log('[register-partner] GSheet status (bg):', r.status))
        .catch(e => console.error('[register-partner] GSheet error (bg):', e))
      if (typeof waitUntil === 'function') waitUntil(gsPromise)
    } else {
      // CRM KO: aspettiamo il GSheet — è il nostro unico salvataggio
      try {
        const gsRes = await fetch(gsheetUrl, { method: 'GET' })
        console.log('[register-partner] GSheet status (fallback):', gsRes.status)
      } catch (e) {
        console.error('[register-partner] GSheet error (fallback):', e)
      }
    }
  } else {
    console.warn('[register-partner] GSHEET_WEBHOOK_URL non configurata — foglio non aggiornato')
  }

  // Se il lead era già presente nel CRM
  if (crmResult.duplicate) {
    return json({
      success: true,
      already_registered: true,
      message: 'Richiesta già ricevuta. Ti ricontatteremo entro 1 giorno lavorativo.'
    }, 200, corsHeaders)
  }

  // ── Risposta al browser ───────────────────────────────────────────────────
  // Rispondiamo sempre 200: o il CRM ha salvato, o il GSheet ha salvato.
  // In nessun caso mostriamo un errore al partner per problemi infrastrutturali.
  return json({
    success: true,
    message: 'Richiesta ricevuta! Ti ricontatteremo entro 1 giorno lavorativo con il tuo kit di benvenuto.'
  }, 200, corsHeaders)
}

// ── OPTIONS preflight ─────────────────────────────────────────────────────
export async function onRequestOptions({ env }) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

/** Helper per creare Response JSON */
function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers })
}
