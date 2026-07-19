/**
 * Cloudflare Pages Function — POST /api/submit-lead
 *
 * Riceve i lead dal form eCura e li invia al CRM TeleMedCare.
 * NON usa HubSpot in alcuna forma.
 *
 * ENV VARS richieste (Cloudflare Pages → Settings → Variables):
 *   CRM_ENDPOINT   — es. https://telemedcare-v12.pages.dev/api/leads/public
 *   CRM_API_KEY    — API key per autenticarsi al CRM
 *   TURNSTILE_SECRET_KEY — Cloudflare Turnstile secret key
 *   CORS_ORIGIN    — es. https://www.ecura.it (o * per dev)
 */

const ALLOWED_METHODS = ['POST', 'OPTIONS']

export async function onRequestPost({ request, env }) {
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
    return new Response(JSON.stringify({ success: false, error: 'Body non valido' }), {
      status: 400, headers: corsHeaders
    })
  }

  // ── Validazione base ──────────────────────────
  const { full_name, phone, email, privacy_consent } = body

  if (!full_name?.trim()) {
    return new Response(JSON.stringify({ success: false, error: 'Nome obbligatorio' }), {
      status: 422, headers: corsHeaders
    })
  }
  if (!phone?.trim()) {
    return new Response(JSON.stringify({ success: false, error: 'Telefono obbligatorio' }), {
      status: 422, headers: corsHeaders
    })
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return new Response(JSON.stringify({ success: false, error: 'Email non valida' }), {
      status: 422, headers: corsHeaders
    })
  }
  if (!privacy_consent) {
    return new Response(JSON.stringify({ success: false, error: 'Consenso privacy obbligatorio' }), {
      status: 422, headers: corsHeaders
    })
  }

  // ── Blocca domini interni ─────────────────────
  const BLOCKED_DOMAINS = ['nur.it', 'nur.com', 'medica-gb.it', 'medicagb.it']
  const emailDomain = email.trim().split('@')[1]?.toLowerCase() || ''
  if (BLOCKED_DOMAINS.some(d => emailDomain === d || emailDomain.endsWith('.' + d))) {
    // Ritorna successo silenzioso — non esporre il blocco
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
  }

  // ── Verifica Turnstile ────────────────────────
  // Il widget Turnstile invia il campo come 'cf-turnstile-response';
  // il JS del form lo manda come 'turnstile_token' — accettiamo entrambi
  const turnstileToken = body['cf-turnstile-response'] || body['turnstile_token']
  if (env.TURNSTILE_SECRET_KEY && turnstileToken) {
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        remoteip: request.headers.get('CF-Connecting-IP') || ''
      }).toString()
    })
    const verifyData = await verifyRes.json()
    if (!verifyData.success) {
      return new Response(JSON.stringify({ success: false, error: 'Verifica di sicurezza fallita. Riprova.' }), {
        status: 400, headers: corsHeaders
      })
    }
  }

  // ── Prepara payload per CRM ───────────────────
  // Split full_name in nome/cognome
  const nameParts = (full_name || '').trim().split(/\s+/)
  const nomeRichiedente = nameParts[0] || full_name
  const cognomeRichiedente = nameParts.slice(1).join(' ') || ''

  // Mappa piano → servizio/piano CRM
  const planRaw = (body.plan || '').toLowerCase()
  let servizio = 'eCura PRO'
  let piano = 'BASE'
  if (planRaw.includes('family')) servizio = 'eCura Family'
  else if (planRaw.includes('premium')) servizio = 'eCura PREMIUM'
  else servizio = 'eCura PRO'
  if (planRaw.includes('avanzato')) piano = 'AVANZATO'

  const crmPayload = {
    // Dati richiedente
    nomeRichiedente,
    cognomeRichiedente,
    email: email.trim().toLowerCase(),
    telefono: phone.trim(),

    // Servizio
    servizio,
    piano,
    tipoServizio: piano === 'AVANZATO' ? 'AVANZATO' : 'BASE',

    // Fonte fissa — identificativo landing proprietaria
    fonte: 'Form eCura',
    hs_object_source: 'FORM',
    hs_object_source_detail_1: `Form eCura_ ${body.utm_source?.toUpperCase() || 'LANDING'}`,
    dettaglio_fonte: 'ecura_landing',
    canale_acquisizione: mapCanale(body.utm_source),

    // Stato
    status: 'NEW',

    // Consensi
    gdprConsent: true,
    consensoMarketing: body.marketing_consent === true || body.marketing_consent === 'true',

    // Tracking
    note: body.message || null,
    utm_source: body.utm_source || null,
    utm_medium: body.utm_medium || null,
    utm_campaign: body.utm_campaign || null,
    utm_content: body.utm_content || null,
    utm_term: body.utm_term || null,
    page_url: body.page_url || null,
    referrer: body.referrer || null,
    landing_variant: body.landing_variant || 'main',
  }

  // ── Invia al CRM ──────────────────────────────
  const crmUrl = env.CRM_ENDPOINT || 'https://telemedcare-v12.pages.dev/api/leads/public'
  const crmApiKey = env.CRM_API_KEY || ''

  console.log('[submit-lead] CRM call:', crmUrl, 'key present:', !!crmApiKey)
  try {
    const crmRes = await fetch(crmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(crmApiKey ? { 'X-API-Key': crmApiKey } : {})
      },
      body: JSON.stringify(crmPayload)
    })

    const crmData = await crmRes.json().catch(() => ({}))
    console.log('[submit-lead] CRM response:', crmRes.status, JSON.stringify(crmData))

    if (crmRes.ok && (crmData.success !== false)) {
      return new Response(JSON.stringify({ success: true, leadId: crmData.id || null }), {
        status: 200, headers: corsHeaders
      })
    } else {
      console.error('[submit-lead] CRM error:', crmRes.status, JSON.stringify(crmData))
      return new Response(JSON.stringify({
        success: false,
        error: `Errore CRM ${crmRes.status}: ${crmData.error || JSON.stringify(crmData)}`
      }), { status: 502, headers: corsHeaders })
    }
  } catch (e) {
    console.error('[submit-lead] fetch error:', e)
    return new Response(JSON.stringify({
      success: false,
      error: 'Errore di connessione. Riprova.'
    }), { status: 503, headers: corsHeaders })
  }
}

// ── OPTIONS preflight ──────────────────────────
export async function onRequestOptions({ env }) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}

// ─── Helper: mappa utm_source → canale CRM ────
function mapCanale(utmSource) {
  if (!utmSource) return null
  const s = utmSource.toLowerCase()
  if (s.includes('meta') || s.includes('facebook') || s.includes('instagram') || s.includes('fb')) return 'META'
  if (s.includes('google') || s.includes('adwords')) return 'GOOGLE'
  if (s.includes('direct')) return 'DIRETTO'
  return 'ALTRO'
}
