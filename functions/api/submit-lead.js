/**
 * Cloudflare Pages Function — POST /api/submit-lead
 *
 * Riceve i lead dal form eCura e li invia:
 *   1. Al CRM TeleMedCare (principale)
 *   2. Al Google Sheet via Apps Script webhook (parallelo, fire-and-forget)
 *
 * ENV VARS richieste (Cloudflare Pages → Settings → Variables):
 *   CRM_ENDPOINT        — es. https://telemedcare-v12.pages.dev/api/leads/public
 *   CRM_API_KEY         — API key per autenticarsi al CRM
 *   CORS_ORIGIN         — es. https://www.ecura.it (o * per dev)
 *   GSHEET_WEBHOOK_URL  — URL /exec del Google Apps Script che scrive nel foglio
 */

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
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
  }

  // ── Mappa piano → dati servizio ───────────────
  const PLAN_MAP = {
    'FAMILY_BASE':      { servizio: 'eCura Family',   piano: 'BASE',     prezzo_anno: 390,  prezzo_rinnovo: 200 },
    'FAMILY_AVANZATO':  { servizio: 'eCura Family',   piano: 'AVANZATO', prezzo_anno: 690,  prezzo_rinnovo: 500 },
    'PRO_BASE':         { servizio: 'eCura PRO',      piano: 'BASE',     prezzo_anno: 480,  prezzo_rinnovo: 240 },
    'PRO_AVANZATO':     { servizio: 'eCura PRO',      piano: 'AVANZATO', prezzo_anno: 840,  prezzo_rinnovo: 600 },
    'PREMIUM_BASE':     { servizio: 'eCura PREMIUM',  piano: 'BASE',     prezzo_anno: 590,  prezzo_rinnovo: 300 },
    'PREMIUM_AVANZATO': { servizio: 'eCura PREMIUM',  piano: 'AVANZATO', prezzo_anno: 990,  prezzo_rinnovo: 750 },
  }
  const planKey = (body.plan || '').toUpperCase().replace(/\s+/g, '_')
  const planData = PLAN_MAP[planKey] || PLAN_MAP['PRO_BASE']
  const { servizio, piano, prezzo_anno, prezzo_rinnovo } = planData

  // ── Split nome/cognome ────────────────────────
  const nameParts = (full_name || '').trim().split(/\s+/)
  const nomeRichiedente    = nameParts[0] || full_name
  const cognomeRichiedente = nameParts.slice(1).join(' ') || ''

  // ── Rilevamento canale/fonte ──────────────────
  // Priorità: parametri UTM espliciti → referrer HTTP → fallback diretto
  const canaleFonte = resolveCanale(body.utm_source, body.utm_medium, body.referrer)

  // ── Timestamp italiano ────────────────────────
  const now = new Date()
  const dataOra = now.toLocaleString('it-IT', { timeZone: 'Europe/Rome' })

  // ── Payload CRM ───────────────────────────────
  const crmPayload = {
    nomeRichiedente,
    cognomeRichiedente,
    email: email.trim().toLowerCase(),
    telefono: phone.trim(),

    servizio,
    piano,
    tipoServizio: piano === 'AVANZATO' ? 'AVANZATO' : 'BASE',
    prezzo_anno,
    prezzo_rinnovo,

    fonte:                   'Form eCura',
    hs_object_source:        'FORM',
    hs_object_source_detail_1: `Form eCura_${(body.utm_source || 'LANDING').toUpperCase()}`,
    dettaglio_fonte:         'ecura_landing',
    canale_acquisizione:     canaleFonte.canale,
    fonte_dettaglio:         canaleFonte.fonte,

    status:           'NEW',
    gdprConsent:      true,
    consensoMarketing: body.marketing_consent === true || body.marketing_consent === 'true',

    note:         body.message  || null,
    utm_source:   body.utm_source   || null,
    utm_medium:   body.utm_medium   || null,
    utm_campaign: body.utm_campaign || null,
    utm_content:  body.utm_content  || null,
    utm_term:     body.utm_term     || null,
    page_url:     body.page_url     || null,
    referrer:     body.referrer     || null,
    landing_variant: body.landing_variant || 'main',
  }

  // ── Payload Google Sheet ──────────────────────
  // Colonne foglio (riga 1):
  // Data | Email | Nome | Cognome | Cellulare | Città | Servizio | Piano desiderato | Note | Fonte
  // Il campo "key" è la SECRET_KEY per autenticare il doPost Apps Script.
  const sheetPayload = {
    // ---- Autenticazione Apps Script ----
    key:              'ecura-import-2026',

    // ---- Colonne foglio ----
    data_ora:         dataOra,                          // → colonna "Data"
    email:            email.trim().toLowerCase(),       // → colonna "Email"
    nome:             nomeRichiedente,                  // → colonna "Nome"
    cognome:          cognomeRichiedente,               // → colonna "Cognome"
    telefono:         phone.trim(),                     // → colonna "Cellulare"
    citta:            '',                               // → colonna "Città" (non raccolta dal form)
    servizio,                                           // → colonna "Servizio"
    piano,                                              // → colonna "Piano desiderato"
    note:             body.message || '',               // → colonna "Note" (arricchita da buildNote in GAS)
    fonte:            canaleFonte.fonte,                // → colonna "Fonte"

    // ---- Dati extra per buildNote() in Apps Script ----
    canale:           canaleFonte.canale,               // GOOGLE / META / ORGANICO / DIRETTO / ALTRO
    utm_source:       body.utm_source   || '',
    utm_medium:       body.utm_medium   || '',
    utm_campaign:     body.utm_campaign || '',
    utm_content:      body.utm_content  || '',
    utm_term:         body.utm_term     || '',
    referrer:         body.referrer     || '',
    page_url:         body.page_url     || '',
    landing:          'ecura_landing_new',
  }

  // ── 1. Invia al CRM (attesa risposta) ─────────
  const crmUrl    = env.CRM_ENDPOINT || 'https://telemedcare-v12.pages.dev/api/leads/public'
  const crmApiKey = env.CRM_API_KEY  || ''

  let crmOk = false
  let crmLeadId = null

  try {
    const crmRes  = await fetch(crmUrl, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(crmApiKey ? { 'X-API-Key': crmApiKey } : {}),
      },
      body: JSON.stringify(crmPayload),
    })
    const crmData = await crmRes.json().catch(() => ({}))
    console.log('[submit-lead] CRM response:', crmRes.status, JSON.stringify(crmData))

    if (crmRes.ok && crmData.success !== false) {
      crmOk     = true
      crmLeadId = crmData.id || null
    } else {
      console.error('[submit-lead] CRM error:', crmRes.status, JSON.stringify(crmData))
    }
  } catch (e) {
    console.error('[submit-lead] CRM fetch error:', e)
  }

  // ── 2. Invia al Google Sheet via GET+querystring (fire-and-forget) ────────
  // NOTA: Apps Script converte POST→GET nei redirect 302, quindi usiamo
  // direttamente GET con i dati in query string per evitare il problema.
  const gsheetBase = env.GSHEET_WEBHOOK_URL || ''
  if (gsheetBase) {
    // Costruisci query string con tutti i campi del payload
    const qs = new URLSearchParams({
      key:          sheetPayload.key,
      action:       'write',
      data_ora:     sheetPayload.data_ora,
      email:        sheetPayload.email,
      nome:         sheetPayload.nome,
      cognome:      sheetPayload.cognome,
      telefono:     sheetPayload.telefono,
      citta:        sheetPayload.citta,
      servizio:     sheetPayload.servizio,
      piano:        sheetPayload.piano,
      fonte:        sheetPayload.fonte,
      canale:       sheetPayload.canale,
      utm_source:   sheetPayload.utm_source,
      utm_medium:   sheetPayload.utm_medium,
      utm_campaign: sheetPayload.utm_campaign,
      utm_content:  sheetPayload.utm_content,
      utm_term:     sheetPayload.utm_term,
      referrer:     sheetPayload.referrer,
      page_url:     sheetPayload.page_url,
      landing:      sheetPayload.landing,
      note:         sheetPayload.note,
    }).toString()

    fetch(`${gsheetBase}?${qs}`, { method: 'GET' })
      .then(r => console.log('[submit-lead] GSheet response:', r.status))
      .catch(e => console.error('[submit-lead] GSheet error:', e))
  } else {
    console.warn('[submit-lead] GSHEET_WEBHOOK_URL non configurata — foglio non aggiornato')
  }

  // ── Risposta al browser ───────────────────────
  if (crmOk) {
    return new Response(JSON.stringify({ success: true, leadId: crmLeadId }), {
      status: 200, headers: corsHeaders
    })
  } else {
    return new Response(JSON.stringify({
      success: false,
      error: 'Errore durante la registrazione. Riprova tra qualche minuto.',
    }), { status: 502, headers: corsHeaders })
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
    },
  })
}

/**
 * resolveCanale — determina canale e fonte dal contesto della richiesta
 *
 * Logica (in ordine di priorità):
 *   1. utm_medium = 'cpc' / 'paid'  → Google Ads o Meta Ads
 *   2. utm_source esplicito          → mappa al canale corrispondente
 *   3. referrer da motore di ricerca → ORGANICO
 *   4. referrer da social            → SOCIAL
 *   5. nessun referrer               → DIRETTO
 *   6. altro referrer                → REFERRAL
 *
 * @param {string} utmSource
 * @param {string} utmMedium
 * @param {string} referrer
 * @returns {{ canale: string, fonte: string }}
 */
function resolveCanale(utmSource, utmMedium, referrer) {
  const src = (utmSource  || '').toLowerCase().trim()
  const med = (utmMedium  || '').toLowerCase().trim()
  const ref = (referrer   || '').toLowerCase().trim()

  // ── 1. UTM espliciti (campagne a pagamento) ──
  if (src || med) {
    // Meta / Facebook / Instagram
    if (src.includes('meta') || src.includes('facebook') || src.includes('fb') || src.includes('instagram')) {
      const isPaid = med === 'cpc' || med === 'paid' || med === 'paidsocial' || med === 'social'
      return { canale: 'META', fonte: isPaid ? 'meta_ads' : 'meta_organico' }
    }
    // Google
    if (src.includes('google') || src.includes('adwords') || src.includes('gdn')) {
      const isPaid = med === 'cpc' || med === 'paid' || med === 'ppc'
      return { canale: 'GOOGLE', fonte: isPaid ? 'google_ads' : 'google_organico' }
    }
    // Email
    if (src.includes('email') || src.includes('newsletter') || med === 'email') {
      return { canale: 'EMAIL', fonte: 'email_marketing' }
    }
    // Diretto esplicito
    if (src.includes('direct') || med === 'none') {
      return { canale: 'DIRETTO', fonte: 'diretto' }
    }
    // Qualsiasi altro UTM tracciato
    return { canale: 'ALTRO', fonte: src || med || 'tracciato' }
  }

  // ── 2. Inferenza da referrer (traffico non UTM-taggato) ──
  if (ref) {
    // Motori di ricerca → organico
    if (ref.includes('google.')   || ref.includes('bing.')  ||
        ref.includes('yahoo.')    || ref.includes('duckduckgo.') ||
        ref.includes('yandex.')   || ref.includes('baidu.')) {
      return { canale: 'ORGANICO', fonte: ref.includes('google') ? 'google_organico' : 'search_organico' }
    }
    // Social
    if (ref.includes('facebook.') || ref.includes('instagram.') ||
        ref.includes('t.co')       || ref.includes('linkedin.')  ||
        ref.includes('youtube.')   || ref.includes('tiktok.')) {
      if (ref.includes('facebook') || ref.includes('instagram')) return { canale: 'META', fonte: 'meta_organico' }
      return { canale: 'SOCIAL', fonte: 'social_organico' }
    }
    // Altro sito referente
    return { canale: 'REFERRAL', fonte: ref.split('/')[0] || 'referral' }
  }

  // ── 3. Nessun referrer, nessun UTM → accesso diretto ──
  return { canale: 'DIRETTO', fonte: 'diretto' }
}
