/**
 * Cloudflare Pages Function — POST /api/register-partner
 *
 * Registra una nuova richiesta di partnership eCura:
 *   1. Valida i dati del form
 *   2. Verifica Cloudflare Turnstile (anti-bot)
 *   3. Genera un codice referral univoco (ECU-XXXX)
 *   4. Salva il partner in D1 (tabella partners)
 *   5. Notifica via CRM / Google Sheet
 *
 * ENV VARS richieste:
 *   DB                    — D1 database binding
 *   TURNSTILE_SECRET_KEY  — secret Cloudflare Turnstile
 *   CRM_ENDPOINT          — endpoint CRM (opzionale, per notifica)
 *   CRM_API_KEY           — API key CRM (opzionale)
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

  const emailNorm = email.trim().toLowerCase()

  // ── Check email duplicata ─────────────────────
  if (env.DB) {
    try {
      const existing = await env.DB
        .prepare('SELECT id, status FROM partners WHERE email = ?')
        .bind(emailNorm)
        .first()
      if (existing) {
        // Partner già registrato → risposta neutra (non rivela dati)
        console.log('[register-partner] Email già presente:', emailNorm, 'status:', existing.status)
        return json({
          success: true,
          already_registered: true,
          message: 'Richiesta già ricevuta. Ti ricontatteremo entro 1 giorno lavorativo.'
        }, 200, corsHeaders)
      }
    } catch (e) {
      console.error('[register-partner] D1 check error:', e)
      // Non bloccare: prosegui anche se il check fallisce
    }
  }

  // ── Genera codice referral univoco ────────────
  const referralCode = await generateUniqueReferralCode(env.DB)
  const referralUrl  = `https://www.ecura.it/?ref=${referralCode}`

  // ── Salva in D1 ───────────────────────────────
  if (env.DB) {
    try {
      await env.DB.prepare(`
        INSERT INTO partners
          (full_name, email, phone, role, city, message,
           referral_code, referral_url, status,
           privacy_consent,
           utm_source, utm_medium, utm_campaign, page_url, referrer)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1, ?, ?, ?, ?, ?)
      `).bind(
        full_name.trim(),
        emailNorm,
        phone.trim(),
        role.trim(),
        city.trim(),
        message.trim(),
        referralCode,
        referralUrl,
        utm_source, utm_medium, utm_campaign, page_url, referrer
      ).run()
      console.log('[register-partner] ✅ Partner salvato in D1:', emailNorm, referralCode)
    } catch (e) {
      console.error('[register-partner] D1 insert error:', e)
      // Non bloccare: notifica via CRM comunque
    }
  }

  // ── Notifica CRM (fire-and-forget) ───────────
  const crmUrl    = env.CRM_ENDPOINT || 'https://telemedcare-v12.pages.dev/api/leads/public'
  const crmApiKey = env.CRM_API_KEY  || ''
  const nameParts = full_name.trim().split(/\s+/)

  const crmPayload = {
    nomeRichiedente:    nameParts[0] || full_name,
    cognomeRichiedente: nameParts.slice(1).join(' ') || '',
    email:              emailNorm,
    telefono:           phone.trim(),
    servizio:           'eCura Partner',
    piano:              role.trim(),
    fonte:              'Form Partner eCura',
    hs_object_source:   'FORM',
    hs_object_source_detail_1: 'Form_PARTNER',
    dettaglio_fonte:    'partner_page',
    canale_acquisizione: utm_source ? 'REFERRAL' : 'ORGANICO',
    fonte_dettaglio:    utm_source || 'partner_page',
    status:             'NEW',
    gdprConsent:        true,
    note: `[PARTNER REQUEST] Codice referral: ${referralCode} | Professione: ${role}${city ? ` | Città: ${city}` : ''}${message ? ` | Note: ${message}` : ''}`,
    utm_source:         utm_source   || 'partner_page',
    utm_medium:         utm_medium   || 'organic',
    utm_campaign:       utm_campaign || 'partner_program',
    page_url:           page_url     || 'https://www.ecura.it/partner/',
    referrer:           referrer     || '',
    landing_variant:    'partner',
  }

  const crmPromise = fetch(crmUrl, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(crmApiKey ? { 'X-API-Key': crmApiKey } : {}),
    },
    body: JSON.stringify(crmPayload),
  })
    .then(r => r.json().catch(() => ({})))
    .then(d => console.log('[register-partner] CRM response:', JSON.stringify(d)))
    .catch(e => console.error('[register-partner] CRM error:', e))

  if (typeof waitUntil === 'function') waitUntil(crmPromise)

  // ── Notifica Google Sheet (fire-and-forget) ───
  const gsheetBase = env.GSHEET_WEBHOOK_URL || ''
  if (gsheetBase) {
    const now = new Date()
    const dataOra = now.toLocaleString('it-IT', { timeZone: 'Europe/Rome' })
    const qs = new URLSearchParams({
      key:          'ecura-import-2026',
      action:       'write',
      data_ora:     dataOra,
      email:        emailNorm,
      nome:         nameParts[0] || full_name,
      cognome:      nameParts.slice(1).join(' ') || '',
      telefono:     phone.trim(),
      citta:        city.trim(),
      servizio:     'eCura Partner',
      piano:        role.trim(),
      fonte:        'partner_page',
      canale:       utm_source ? 'REFERRAL' : 'ORGANICO',
      utm_source:   utm_source,
      utm_medium:   utm_medium,
      utm_campaign: utm_campaign || 'partner_program',
      page_url:     page_url,
      referrer:     referrer,
      landing:      'partner',
      note:         `[PARTNER] Codice: ${referralCode} | ${role}${message ? ` | ${message}` : ''}`,
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

// ── OPTIONS preflight ────────────────────────────
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

// ── Helpers ──────────────────────────────────────

/** Genera un codice tipo ECU-XXXX univoco, verificato contro D1 */
async function generateUniqueReferralCode(db) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I per evitare confusione
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = 'ECU-'
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    // Verifica unicità in D1
    if (db) {
      try {
        const exists = await db
          .prepare('SELECT id FROM partners WHERE referral_code = ?')
          .bind(code)
          .first()
        if (!exists) return code
      } catch {
        return code // Se D1 non risponde, usiamo il codice generato
      }
    } else {
      return code // Senza D1, restituiamo il codice senza verifica
    }
  }
  // Fallback: aggiungi timestamp per garantire unicità
  return 'ECU-' + Date.now().toString(36).slice(-4).toUpperCase()
}

/** Helper per creare Response JSON */
function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers })
}
