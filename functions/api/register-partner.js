/**
 * Cloudflare Pages Function — POST /api/register-partner
 *
 * Registra una nuova richiesta di partnership eCura:
 *   1. Valida i dati del form
 *   2. Verifica Cloudflare Turnstile (anti-bot)
 *   3. Invia al dataset PARTNER del CRM TeleMedCare (/api/partners/public)
 *   4. Notifica via Google Sheet (opzionale)
 *
 * ENV VARS richieste:
 *   TURNSTILE_SECRET_KEY  — secret Cloudflare Turnstile
 *   CRM_PARTNERS_URL      — URL endpoint partner CRM (default: https://telemedcare-v12.pages.dev/api/partners/public)
 *   CRM_API_KEY           — API key CRM (opzionale, se configurata nel CRM)
 *   GSHEET_WEBHOOK_URL    — Google Apps Script webhook (opzionale)
 *   CORS_ORIGIN           — es. https://www.ecura.it
 *
 * NOTA: I partner vengono ora salvati direttamente nel database TeleMedCare
 *       (tabella "partners", migration 0106), NON più nella D1 di ecura-landing.
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

  const emailNorm   = email.trim().toLowerCase()
  const nameParts   = full_name.trim().split(/\s+/)
  const nomeField   = nameParts[0] || full_name.trim()
  const cognomeField = nameParts.slice(1).join(' ') || ''

  // ── Invia al dataset PARTNER del CRM TeleMedCare ──────────────────────────
  const crmPartnersUrl = env.CRM_PARTNERS_URL || 'https://telemedcare-v12.pages.dev/api/partners/public'
  const crmApiKey      = env.CRM_API_KEY || ''

  const partnerPayload = {
    nome:             nomeField,
    cognome:          cognomeField,
    email:            emailNorm,
    telefono:         phone.trim(),
    ruolo:            role.trim(),
    citta:            city.trim() || null,
    messaggio:        message.trim() || null,
    privacy_consent:  true,
    utm_source:       utm_source   || null,
    utm_medium:       utm_medium   || null,
    utm_campaign:     utm_campaign || null,
    page_url:         page_url     || 'https://www.ecura.it/partner/',
    referrer:         referrer     || null,
  }

  let crmResult = { success: false, referral_code: null, referral_url: null, status: 'pending', duplicate: false }

  try {
    const crmRes = await fetch(crmPartnersUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(crmApiKey ? { 'X-API-Key': crmApiKey } : {}),
      },
      body: JSON.stringify(partnerPayload),
    })

    if (crmRes.ok) {
      crmResult = await crmRes.json()
      console.log(`[register-partner] ✅ Partner salvato nel CRM: ${emailNorm} → ${crmResult.referral_code || 'pending'}`)
    } else {
      const errText = await crmRes.text().catch(() => 'unknown')
      console.error(`[register-partner] CRM error ${crmRes.status}:`, errText)
      // Non bloccare: rispondi comunque positivamente (il dato arriverà via GSheet)
    }
  } catch (e) {
    console.error('[register-partner] CRM fetch error:', e)
    // Non bloccare il form
  }

  // Se il partner era già registrato nel CRM
  if (crmResult.duplicate || crmResult.already_registered) {
    return json({
      success: true,
      already_registered: true,
      referral_code: crmResult.referral_code || null,
      message: 'Richiesta già ricevuta. Ti ricontatteremo entro 1 giorno lavorativo.'
    }, 200, corsHeaders)
  }

  const referralCode = crmResult.referral_code || null
  const referralUrl  = crmResult.referral_url  || (referralCode ? `https://www.ecura.it/?ref=${referralCode}` : null)

  // ── Notifica Google Sheet (fire-and-forget) ───
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
      servizio:     'eCura Partner',
      piano:        role.trim(),
      fonte:        'partner_page',
      canale:       utm_source ? 'REFERRAL' : 'ORGANICO',
      utm_source:   utm_source   || '',
      utm_medium:   utm_medium   || '',
      utm_campaign: utm_campaign || 'partner_program',
      page_url:     page_url     || '',
      referrer:     referrer     || '',
      landing:      'partner',
      note: `[PARTNER] ${referralCode ? `Codice: ${referralCode} | ` : ''}${role}${message ? ` | ${message}` : ''}`,
    }).toString()

    const gsPromise = fetch(`${gsheetBase}?${qs}`, { method: 'GET' })
      .then(r => console.log('[register-partner] GSheet status:', r.status))
      .catch(e => console.error('[register-partner] GSheet error:', e))

    if (typeof waitUntil === 'function') waitUntil(gsPromise)
  }

  // ── Risposta al browser ───────────────────────
  return json({
    success: true,
    referral_code: referralCode,
    referral_url:  referralUrl,
    message: 'Richiesta ricevuta! Ti ricontatteremo entro 1 giorno lavorativo con il tuo kit di benvenuto.'
  }, 200, corsHeaders)
}

// ── OPTIONS preflight ─────────────────────────────
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
