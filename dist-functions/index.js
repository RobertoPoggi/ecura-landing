var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/admin/articles/[slug].js
var COOKIE_NAME = "ecura_admin_session";
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((part) => {
    const [k, ...v] = part.trim().split("=");
    cookies[k.trim()] = v.join("=");
  });
  return cookies;
}
__name(parseCookies, "parseCookies");
async function checkAuth(request, db) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return await db.prepare(
    'SELECT s.*, u.username FROM admin_sessions s JOIN admin_users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")'
  ).bind(token).first();
}
__name(checkAuth, "checkAuth");
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};
async function onRequest({ request, env, params }) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  const db = env.DB;
  const session = await checkAuth(request, db);
  if (!session) return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 401, headers: corsHeaders });
  const slug = params.slug;
  if (!slug) return new Response(JSON.stringify({ error: "Slug richiesto" }), { status: 400, headers: corsHeaders });
  if (request.method === "GET") {
    const article = await db.prepare("SELECT * FROM blog_articles WHERE slug = ?").bind(slug).first();
    if (!article) return new Response(JSON.stringify({ error: "Articolo non trovato" }), { status: 404, headers: corsHeaders });
    return new Response(JSON.stringify({ article }), { status: 200, headers: corsHeaders });
  }
  if (request.method === "PUT") {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "JSON non valido" }), { status: 400, headers: corsHeaders });
    }
    const fields = [
      "title",
      "description",
      "category",
      "tag_color",
      "author",
      "date_published",
      "read_time",
      "hero_image",
      "hero_image_alt",
      "summary",
      "content",
      "related_1_slug",
      "related_1_title",
      "related_1_excerpt",
      "related_1_tag",
      "related_2_slug",
      "related_2_title",
      "related_2_excerpt",
      "related_2_tag",
      "related_3_slug",
      "related_3_title",
      "related_3_excerpt",
      "related_3_tag",
      "status"
    ];
    const updates = [];
    const values = [];
    fields.forEach((f) => {
      if (body[f] !== void 0) {
        updates.push(`${f} = ?`);
        values.push(body[f] || null);
      }
    });
    if (updates.length === 0) return new Response(JSON.stringify({ error: "Nessun campo da aggiornare" }), { status: 400, headers: corsHeaders });
    updates.push('date_modified = datetime("now")');
    updates.push('updated_at = datetime("now")');
    values.push(slug);
    await db.prepare(`UPDATE blog_articles SET ${updates.join(", ")} WHERE slug = ?`).bind(...values).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
  }
  if (request.method === "DELETE") {
    const result = await db.prepare("DELETE FROM blog_articles WHERE slug = ?").bind(slug).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
}
__name(onRequest, "onRequest");

// api/admin/articles.js
var COOKIE_NAME2 = "ecura_admin_session";
function parseCookies2(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((part) => {
    const [k, ...v] = part.trim().split("=");
    cookies[k.trim()] = v.join("=");
  });
  return cookies;
}
__name(parseCookies2, "parseCookies");
async function checkAuth2(request, db) {
  const cookies = parseCookies2(request.headers.get("Cookie"));
  const token = cookies[COOKIE_NAME2];
  if (!token) return null;
  return await db.prepare(
    'SELECT s.*, u.username FROM admin_sessions s JOIN admin_users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")'
  ).bind(token).first();
}
__name(checkAuth2, "checkAuth");
var corsHeaders2 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};
async function onRequest2({ request, env }) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders2 });
  const db = env.DB;
  const session = await checkAuth2(request, db);
  if (!session) return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 401, headers: corsHeaders2 });
  if (request.method === "GET") {
    const { results } = await db.prepare(
      "SELECT id, slug, title, category, tag_color, date_published, read_time, status, hero_image, updated_at FROM blog_articles ORDER BY date_published DESC"
    ).all();
    return new Response(JSON.stringify({ articles: results || [] }), { status: 200, headers: corsHeaders2 });
  }
  if (request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "JSON non valido" }), { status: 400, headers: corsHeaders2 });
    }
    const {
      slug,
      title,
      description,
      category,
      tag_color,
      author,
      date_published,
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
      related_3_tag
    } = body;
    if (!slug || !title) {
      return new Response(JSON.stringify({ error: "Campi obbligatori: slug e title" }), { status: 400, headers: corsHeaders2 });
    }
    try {
      await db.prepare(`
        INSERT INTO blog_articles (
          slug, title, description, category, tag_color, author,
          date_published, date_modified, read_time, hero_image, hero_image_alt,
          summary, content,
          related_1_slug, related_1_title, related_1_excerpt, related_1_tag,
          related_2_slug, related_2_title, related_2_excerpt, related_2_tag,
          related_3_slug, related_3_title, related_3_excerpt, related_3_tag,
          status, updated_at
        ) VALUES (?,?,?,?,?,?,?,datetime('now'),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'published',datetime('now'))
      `).bind(
        slug,
        title,
        description || "",
        category || "Informazione",
        tag_color || "#068D86",
        author || "Redazione eCura",
        date_published,
        read_time || "5 min lettura",
        hero_image || "/img/blog/default.jpg",
        hero_image_alt || "",
        summary || "",
        content,
        related_1_slug || null,
        related_1_title || null,
        related_1_excerpt || null,
        related_1_tag || null,
        related_2_slug || null,
        related_2_title || null,
        related_2_excerpt || null,
        related_2_tag || null,
        related_3_slug || null,
        related_3_title || null,
        related_3_excerpt || null,
        related_3_tag || null
      ).run();
      return new Response(JSON.stringify({ ok: true, slug }), { status: 201, headers: corsHeaders2 });
    } catch (e) {
      if (e.message && e.message.includes("UNIQUE")) {
        return new Response(JSON.stringify({ error: "Slug gi\xE0 esistente. Scegli uno slug diverso." }), { status: 409, headers: corsHeaders2 });
      }
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders2 });
    }
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders2 });
}
__name(onRequest2, "onRequest");

// api/admin/auth.js
async function hashPassword(password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode("ecura-salt-2026"), iterations: 1e5, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");
async function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(generateToken, "generateToken");
var COOKIE_NAME3 = "ecura_admin_session";
var SESSION_DURATION = 60 * 60 * 24 * 7;
function parseCookies3(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((part) => {
    const [k, ...v] = part.trim().split("=");
    cookies[k.trim()] = v.join("=");
  });
  return cookies;
}
__name(parseCookies3, "parseCookies");
async function onRequest3({ request, env }) {
  const method = request.method;
  const corsHeaders4 = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders4 });
  }
  const db = env.DB;
  if (method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders4 });
    }
    const { username, password } = body;
    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Username e password richiesti" }), { status: 400, headers: corsHeaders4 });
    }
    const hash = await hashPassword(password);
    const user = await db.prepare("SELECT * FROM admin_users WHERE username = ? AND password_hash = ?").bind(username, hash).first();
    if (!user) {
      return new Response(JSON.stringify({ error: "Credenziali non valide" }), { status: 401, headers: corsHeaders4 });
    }
    const token = await generateToken();
    const expires = new Date(Date.now() + SESSION_DURATION * 1e3).toUTCString();
    await db.prepare('UPDATE admin_users SET last_login = datetime("now") WHERE id = ?').bind(user.id).run();
    await db.prepare('INSERT OR REPLACE INTO admin_sessions (token, user_id, expires_at) VALUES (?, ?, datetime("now", "+7 days"))').bind(token, user.id).run();
    const cookieValue = `${COOKIE_NAME3}=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION}; Path=/`;
    return new Response(JSON.stringify({ ok: true, username: user.username }), {
      status: 200,
      headers: { ...corsHeaders4, "Set-Cookie": cookieValue }
    });
  }
  if (method === "GET") {
    const cookies = parseCookies3(request.headers.get("Cookie"));
    const token = cookies[COOKIE_NAME3];
    if (!token) return new Response(JSON.stringify({ authenticated: false }), { status: 401, headers: corsHeaders4 });
    const session = await db.prepare('SELECT s.*, u.username FROM admin_sessions s JOIN admin_users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")').bind(token).first();
    if (!session) return new Response(JSON.stringify({ authenticated: false }), { status: 401, headers: corsHeaders4 });
    return new Response(JSON.stringify({ authenticated: true, username: session.username }), { status: 200, headers: corsHeaders4 });
  }
  if (method === "DELETE") {
    const cookies = parseCookies3(request.headers.get("Cookie"));
    const token = cookies[COOKIE_NAME3];
    if (token) {
      await db.prepare("DELETE FROM admin_sessions WHERE token = ?").bind(token).run();
    }
    const clearCookie = `${COOKIE_NAME3}=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`;
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders4, "Set-Cookie": clearCookie }
    });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders4 });
}
__name(onRequest3, "onRequest");

// api/admin/password.js
var COOKIE_NAME4 = "ecura_admin_session";
function parseCookies4(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((part) => {
    const [k, ...v] = part.trim().split("=");
    cookies[k.trim()] = v.join("=");
  });
  return cookies;
}
__name(parseCookies4, "parseCookies");
async function hashPassword2(password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode("ecura-salt-2026"), iterations: 1e5, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword2, "hashPassword");
async function checkAuth3(request, db) {
  const cookies = parseCookies4(request.headers.get("Cookie"));
  const token = cookies[COOKIE_NAME4];
  if (!token) return null;
  const session = await db.prepare(
    'SELECT s.*, u.username FROM admin_sessions s JOIN admin_users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")'
  ).bind(token).first();
  return session || null;
}
__name(checkAuth3, "checkAuth");
var corsHeaders3 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};
async function onRequest4({ request, env }) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders3 });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders3 });
  const db = env.DB;
  const session = await checkAuth3(request, db);
  if (!session) return new Response(JSON.stringify({ error: "Non autorizzato" }), { status: 401, headers: corsHeaders3 });
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON non valido" }), { status: 400, headers: corsHeaders3 });
  }
  const { current_password, new_password } = body;
  if (!current_password || !new_password) {
    return new Response(JSON.stringify({ error: "current_password e new_password richiesti" }), { status: 400, headers: corsHeaders3 });
  }
  if (new_password.length < 8) {
    return new Response(JSON.stringify({ error: "Nuova password deve essere di almeno 8 caratteri" }), { status: 400, headers: corsHeaders3 });
  }
  const currentHash = await hashPassword2(current_password);
  const user = await db.prepare(
    "SELECT * FROM admin_users WHERE id = ? AND password_hash = ?"
  ).bind(session.user_id, currentHash).first();
  if (!user) return new Response(JSON.stringify({ error: "Password corrente non valida" }), { status: 401, headers: corsHeaders3 });
  const newHash = await hashPassword2(new_password);
  await db.prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?").bind(newHash, session.user_id).run();
  return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders3 });
}
__name(onRequest4, "onRequest");

// api/submit-lead.js
async function onRequestPost({ request, env, waitUntil }) {
  const corsOrigin = env.CORS_ORIGIN || "*";
  const corsHeaders4 = {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Body non valido" }), {
      status: 400,
      headers: corsHeaders4
    });
  }
  const turnstileSecret = env.TURNSTILE_SECRET_KEY || "0x4AAAAAAAD4s8Ii-HWSeb_PcPaGzkR38QL4";
  if (turnstileSecret) {
    const turnstileToken = body["cf-turnstile-response"] || "";
    const cfIp = request.headers.get("CF-Connecting-IP") || "";
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: turnstileSecret,
        response: turnstileToken,
        remoteip: cfIp
      })
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return new Response(JSON.stringify({ success: false, error: "Verifica di sicurezza fallita. Ricarica la pagina e riprova." }), {
        status: 400,
        headers: corsHeaders4
      });
    }
  }
  const { full_name, phone, email, privacy_consent } = body;
  if (!full_name?.trim()) {
    return new Response(JSON.stringify({ success: false, error: "Nome obbligatorio" }), {
      status: 422,
      headers: corsHeaders4
    });
  }
  if (!phone?.trim()) {
    return new Response(JSON.stringify({ success: false, error: "Telefono obbligatorio" }), {
      status: 422,
      headers: corsHeaders4
    });
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return new Response(JSON.stringify({ success: false, error: "Email non valida" }), {
      status: 422,
      headers: corsHeaders4
    });
  }
  if (!privacy_consent) {
    return new Response(JSON.stringify({ success: false, error: "Consenso privacy obbligatorio" }), {
      status: 422,
      headers: corsHeaders4
    });
  }
  const BLOCKED_DOMAINS = ["nur.it", "nur.com", "medica-gb.it", "medicagb.it"];
  const emailDomain = email.trim().split("@")[1]?.toLowerCase() || "";
  if (BLOCKED_DOMAINS.some((d) => emailDomain === d || emailDomain.endsWith("." + d))) {
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders4 });
  }
  const emailNorm = email.trim().toLowerCase();
  const TEST_EMAIL_PATTERNS = [
    /^t@t\./i,
    /^b@b\./i,
    /^bot@/i,
    /^test@/i,
    /^prova@/i,
    /^demo@/i,
    /^fake@/i,
    /^noreply-exit@/i,
    /@test\./i,
    /@example\./i,
    /@mailtest\./i
  ];
  const TEST_PHONES = ["39123", "00000", "11111", "12345", "99999"];
  const phoneTrim = (phone || "").trim().replace(/\s+/g, "");
  const isTestEmail = TEST_EMAIL_PATTERNS.some((rx) => rx.test(emailNorm));
  const isTestPhone = TEST_PHONES.some((p) => phoneTrim === p || phoneTrim.endsWith(p));
  if (isTestEmail || isTestPhone) {
    console.warn(`[submit-lead] \u{1F6AB} Lead di test bloccato: email=${emailNorm} phone=${phoneTrim}`);
    return new Response(JSON.stringify({ success: true, _test: true }), { status: 200, headers: corsHeaders4 });
  }
  const PLAN_MAP = {
    "FAMILY_BASE": { servizio: "eCura Family", piano: "BASE", prezzo_anno: 390, prezzo_rinnovo: 200 },
    "FAMILY_AVANZATO": { servizio: "eCura Family", piano: "AVANZATO", prezzo_anno: 690, prezzo_rinnovo: 500 },
    "PRO_BASE": { servizio: "eCura PRO", piano: "BASE", prezzo_anno: 480, prezzo_rinnovo: 240 },
    "PRO_AVANZATO": { servizio: "eCura PRO", piano: "AVANZATO", prezzo_anno: 840, prezzo_rinnovo: 600 },
    "PREMIUM_BASE": { servizio: "eCura PREMIUM", piano: "BASE", prezzo_anno: 590, prezzo_rinnovo: 300 },
    "PREMIUM_AVANZATO": { servizio: "eCura PREMIUM", piano: "AVANZATO", prezzo_anno: 990, prezzo_rinnovo: 750 }
  };
  const planKey = (body.plan || "").toUpperCase().replace(/\s+/g, "_");
  const planData = PLAN_MAP[planKey] || PLAN_MAP["PRO_BASE"];
  const { servizio, piano, prezzo_anno, prezzo_rinnovo } = planData;
  const nameParts = (full_name || "").trim().split(/\s+/);
  const nomeRichiedente = nameParts[0] || full_name;
  const cognomeRichiedente = nameParts.slice(1).join(" ") || "";
  const canaleFonte = resolveCanale(body.utm_source, body.utm_medium, body.referrer);
  const now = /* @__PURE__ */ new Date();
  const dataOra = now.toLocaleString("it-IT", { timeZone: "Europe/Rome" });
  const crmPayload = {
    nomeRichiedente,
    cognomeRichiedente,
    email: email.trim().toLowerCase(),
    telefono: phone.trim(),
    servizio,
    piano,
    tipoServizio: piano === "AVANZATO" ? "AVANZATO" : "BASE",
    prezzo_anno,
    prezzo_rinnovo,
    fonte: "Form eCura",
    hs_object_source: "FORM",
    hs_object_source_detail_1: `Form eCura_${(body.utm_source || "LANDING").toUpperCase()}`,
    dettaglio_fonte: "ecura_landing",
    canale_acquisizione: canaleFonte.canale,
    fonte_dettaglio: canaleFonte.fonte,
    status: "NEW",
    gdprConsent: true,
    consensoMarketing: body.marketing_consent === true || body.marketing_consent === "true",
    note: body.message || null,
    utm_source: body.utm_source || null,
    utm_medium: body.utm_medium || null,
    utm_campaign: body.utm_campaign || null,
    utm_content: body.utm_content || null,
    utm_term: body.utm_term || null,
    page_url: body.page_url || null,
    referrer: body.referrer || null,
    landing_variant: body.landing_variant || "main"
  };
  const sheetPayload = {
    // ---- Autenticazione Apps Script ----
    key: "ecura-import-2026",
    // ---- Colonne foglio ----
    data_ora: dataOra,
    // → colonna "Data"
    email: email.trim().toLowerCase(),
    // → colonna "Email"
    nome: nomeRichiedente,
    // → colonna "Nome"
    cognome: cognomeRichiedente,
    // → colonna "Cognome"
    telefono: phone.trim(),
    // → colonna "Cellulare"
    citta: "",
    // → colonna "Città" (non raccolta dal form)
    servizio,
    // → colonna "Servizio"
    piano,
    // → colonna "Piano desiderato"
    note: body.message || "",
    // → colonna "Note" (arricchita da buildNote in GAS)
    fonte: canaleFonte.fonte,
    // → colonna "Fonte"
    // ---- Dati extra per buildNote() in Apps Script ----
    canale: canaleFonte.canale,
    // GOOGLE / META / ORGANICO / DIRETTO / ALTRO
    utm_source: body.utm_source || "",
    utm_medium: body.utm_medium || "",
    utm_campaign: body.utm_campaign || "",
    utm_content: body.utm_content || "",
    utm_term: body.utm_term || "",
    referrer: body.referrer || "",
    page_url: body.page_url || "",
    landing: "ecura_landing_new"
  };
  const crmUrl = env.CRM_ENDPOINT || "https://telemedcare-v12.pages.dev/api/leads/public";
  const crmApiKey = env.CRM_API_KEY || "";
  let crmOk = false;
  let crmLeadId = null;
  try {
    const crmRes = await fetch(crmUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...crmApiKey ? { "X-API-Key": crmApiKey } : {}
      },
      body: JSON.stringify(crmPayload)
    });
    const crmData = await crmRes.json().catch(() => ({}));
    console.log("[submit-lead] CRM response:", crmRes.status, JSON.stringify(crmData));
    if (crmRes.ok && crmData.success !== false) {
      crmOk = true;
      crmLeadId = crmData.id || crmData.leadId || null;
    } else {
      console.error("[submit-lead] CRM error:", crmRes.status, JSON.stringify(crmData));
    }
  } catch (e) {
    console.error("[submit-lead] CRM fetch error:", e);
  }
  const gsheetBase = env.GSHEET_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbyXf5dP6uNCdd3JWj08PAjBmBuiSIEThaL5IL2xFkAIlqYwaCGDZKK_vfql6gVoNESdvA/exec";
  if (gsheetBase) {
    const qs = new URLSearchParams({
      key: sheetPayload.key,
      action: "write",
      data_ora: sheetPayload.data_ora,
      email: sheetPayload.email,
      nome: sheetPayload.nome,
      cognome: sheetPayload.cognome,
      telefono: sheetPayload.telefono,
      citta: sheetPayload.citta,
      servizio: sheetPayload.servizio,
      piano: sheetPayload.piano,
      fonte: sheetPayload.fonte,
      canale: sheetPayload.canale,
      utm_source: sheetPayload.utm_source,
      utm_medium: sheetPayload.utm_medium,
      utm_campaign: sheetPayload.utm_campaign,
      utm_content: sheetPayload.utm_content,
      utm_term: sheetPayload.utm_term,
      referrer: sheetPayload.referrer,
      page_url: sheetPayload.page_url,
      landing: sheetPayload.landing,
      note: sheetPayload.note,
      lead_id: crmLeadId || ""
    }).toString();
    const gsheetPromise = fetch(`${gsheetBase}?${qs}`, { method: "GET" }).then((r) => console.log("[submit-lead] GSheet response:", r.status)).catch((e) => console.error("[submit-lead] GSheet error:", e));
    if (typeof waitUntil === "function") {
      waitUntil(gsheetPromise);
    }
  } else {
    console.warn("[submit-lead] GSHEET_WEBHOOK_URL non configurata \u2014 foglio non aggiornato");
  }
  if (crmOk) {
    return new Response(JSON.stringify({ success: true, leadId: crmLeadId }), {
      status: 200,
      headers: corsHeaders4
    });
  } else {
    console.error("[submit-lead] CRM KO \u2014 lead non registrato nel CRM");
    return new Response(JSON.stringify({ success: false, error: "Servizio temporaneamente non disponibile. Riprova tra qualche minuto." }), {
      status: 502,
      headers: corsHeaders4
    });
  }
}
__name(onRequestPost, "onRequestPost");
async function onRequestOptions({ env }) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": env.CORS_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions, "onRequestOptions");
function resolveCanale(utmSource, utmMedium, referrer) {
  const src = (utmSource || "").toLowerCase().trim();
  const med = (utmMedium || "").toLowerCase().trim();
  const ref = (referrer || "").toLowerCase().trim();
  if (src || med) {
    if (src.includes("meta") || src.includes("facebook") || src.includes("fb") || src.includes("instagram")) {
      const isPaid = med === "cpc" || med === "paid" || med === "paidsocial" || med === "social";
      return { canale: "META", fonte: isPaid ? "meta_ads" : "meta_organico" };
    }
    if (src.includes("google") || src.includes("adwords") || src.includes("gdn")) {
      const isPaid = med === "cpc" || med === "paid" || med === "ppc";
      return { canale: "GOOGLE", fonte: isPaid ? "google_ads" : "google_organico" };
    }
    if (src.includes("email") || src.includes("newsletter") || med === "email") {
      return { canale: "EMAIL", fonte: "email_marketing" };
    }
    if (src.includes("direct") || med === "none") {
      return { canale: "DIRETTO", fonte: "diretto" };
    }
    return { canale: "ALTRO", fonte: src || med || "tracciato" };
  }
  if (ref) {
    if (ref.includes("google.") || ref.includes("bing.") || ref.includes("yahoo.") || ref.includes("duckduckgo.") || ref.includes("yandex.") || ref.includes("baidu.")) {
      return { canale: "ORGANICO", fonte: ref.includes("google") ? "google_organico" : "search_organico" };
    }
    if (ref.includes("facebook.") || ref.includes("instagram.") || ref.includes("t.co") || ref.includes("linkedin.") || ref.includes("youtube.") || ref.includes("tiktok.")) {
      if (ref.includes("facebook") || ref.includes("instagram")) return { canale: "META", fonte: "meta_organico" };
      return { canale: "SOCIAL", fonte: "social_organico" };
    }
    return { canale: "REFERRAL", fonte: ref.split("/")[0] || "referral" };
  }
  return { canale: "DIRETTO", fonte: "diretto" };
}
__name(resolveCanale, "resolveCanale");

// blog/[slug].js
async function onRequest5({ request, env, params }) {
  const db = env.DB;
  const slug = (params.slug || "").replace(/\/+$/, "");
  if (!slug) return passThrough(request, env);
  if (slug.includes(".")) return passThrough(request, env);
  if (!db) return passThrough(request, env);
  let article;
  try {
    article = await db.prepare(
      "SELECT * FROM blog_articles WHERE slug = ? AND status = ?"
    ).bind(slug, "published").first();
  } catch (e) {
    return passThrough(request, env);
  }
  if (!article) {
    return new Response(notFoundHtml(slug), {
      status: 404,
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
  const html = renderArticle(article);
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300"
    }
  });
}
__name(onRequest5, "onRequest");
function passThrough(request, env) {
  if (env && env.ASSETS) return env.ASSETS.fetch(request);
  return fetch(request);
}
__name(passThrough, "passThrough");
function decodeEntities(str) {
  if (!str) return "";
  return str.replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
__name(decodeEntities, "decodeEntities");
function esc(s) {
  if (!s) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
__name(esc, "esc");
function fmtDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  } catch {
    return d;
  }
}
__name(fmtDate, "fmtDate");
function renderArticle(a) {
  const title = decodeEntities(a.title || "");
  const desc = decodeEntities(a.description || "");
  let rawContent = decodeEntities(a.content || "");
  rawContent = rawContent.replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "");
  rawContent = rawContent.replace(/<img(?![^>]*class="[^"]*product)[^>]+>/gi, "");
  const content = rawContent;
  const hero = a.hero_image || "/img/blog/default.jpg";
  const heroAlt = decodeEntities(a.hero_image_alt || title);
  const cat = decodeEntities(a.category || "");
  const color = a.tag_color || "#068D86";
  const author = decodeEntities(a.author || "Redazione eCura");
  const date = fmtDate(a.date_published);
  const read = decodeEntities(a.read_time || "");
  const slug = a.slug || "";
  const canonical = `https://www.ecura.it/blog/${slug}/`;
  let faqSchemaBlock = "";
  try {
    const faqMatches = [...content.matchAll(/<div[^>]*class="faq-item"[^>]*>[\s\S]*?<strong>([\s\S]*?)<\/strong>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];
    let faqH3Matches = [];
    const faqSectionMatch = content.match(/<h2[^>]*>[^<]*[Dd]omande[^<]*<\/h2>([\s\S]*?)(?:<h2|<div class="article-cta"|$)/i);
    if (faqSectionMatch) {
      faqH3Matches = [...faqSectionMatch[1].matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)];
    }
    const allFaqs = [
      ...faqMatches.map((m) => ({ q: m[1], a: m[2] })),
      ...faqH3Matches.map((m) => ({ q: m[1], a: m[2] }))
    ];
    if (allFaqs.length > 0) {
      const qas = allFaqs.map((f) => ({
        "@type": "Question",
        "name": f.q.replace(/<[^>]+>/g, "").trim(),
        "acceptedAnswer": { "@type": "Answer", "text": f.a.replace(/<[^>]+>/g, "").trim() }
      }));
      faqSchemaBlock = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": qas });
    }
  } catch (e) {
  }
  let howtoSchemaBlock = "";
  try {
    const howtoMatches = [...content.matchAll(/<li[^>]*>[\s\S]*?<strong>(\d+\.\s[^<]+)<\/strong>:?\s*([\s\S]*?)<\/li>/gi)];
    if (howtoMatches.length >= 5) {
      const steps = howtoMatches.map((m, i) => ({
        "@type": "HowToStep",
        "position": i + 1,
        "name": m[1].replace(/^\d+\.\s*/, "").trim(),
        "text": m[2].replace(/<[^>]+>/g, "").trim()
      }));
      howtoSchemaBlock = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": title,
        "description": desc,
        "step": steps
      });
    }
  } catch (e) {
  }
  const relatedCards = [
    { slug: a.related_1_slug, title: a.related_1_title, excerpt: a.related_1_excerpt, tag: a.related_1_tag },
    { slug: a.related_2_slug, title: a.related_2_title, excerpt: a.related_2_excerpt, tag: a.related_2_tag },
    { slug: a.related_3_slug, title: a.related_3_title, excerpt: a.related_3_excerpt, tag: a.related_3_tag }
  ].filter((r) => r.slug && r.title).map((r) => `
    <div class="related-card">
      <span class="tag">${esc(decodeEntities(r.tag || cat))}</span>
      <h3><a href="/blog/${esc(r.slug)}/">${esc(decodeEntities(r.title))}</a></h3>
      ${r.excerpt ? `<p>${esc(decodeEntities(r.excerpt))}</p>` : ""}
      <a href="/blog/${esc(r.slug)}/">Leggi l'articolo &rarr;</a>
    </div>`).join("");
  const relatedSection = relatedCards ? `
    <section class="related-section">
      <div class="container">
        <h2>Potrebbe interessarti anche</h2>
        <div class="related-grid">${relatedCards}</div>
      </div>
    </section>` : "";
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | eCura</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:locale" content="it_IT">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="eCura - Teleassistenza Anziani">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(hero)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(hero)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;600;700&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;600;700&display=swap"></noscript>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"></noscript>
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/blog.css?v=2">
<style>.ecura-email::before{content:attr(data-e)}</style>
/* Comparison Table */
.comp-table{width:100%;border-collapse:collapse;margin:28px 0;font-size:.92rem}
.comp-table th{background:#080E49;color:#fff;padding:14px 16px;text-align:left;font-size:.95rem}
.comp-table th.best{background:#068D86!important;color:#fff!important;font-size:1.05rem;font-weight:700;border-top:3px solid #04b8ae}
.comp-table td{padding:11px 14px;border-bottom:1px solid #f0f0f0;color:#3D3C3B}
.comp-table tr:nth-child(even) td{background:#f7f4ef}
.comp-table .yes{color:#068D86;font-weight:600}
.comp-table .no{color:#cc0000}
.comp-table .low{color:#999;font-style:italic;font-size:.85rem}
.comp-table td.best{background:rgba(6,141,134,.07)!important}
.comp-table tr:nth-child(even) td.best{background:rgba(6,141,134,.12)!important}
/* Product Comparison Cards */
.img-caption{font-size:.78rem;color:#888;text-align:center;margin-top:6px;font-style:italic}
.badge-cert{display:inline-block;padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:600;margin-top:4px}
.cert-yes{background:#e6f9f7;color:#068D86;border:1px solid #068D86}
.cert-no{background:#fef0f0;color:#cc2200;border:1px solid #cc2200}
.product-card{border:1px solid #e3dfdd;border-radius:12px;overflow:hidden;margin:20px 0 32px;box-shadow:0 2px 10px rgba(0,0,0,.06)}
.product-card-header{background:#f7f4ef;padding:16px 20px;border-bottom:1px solid #e3dfdd;display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.product-card-body{display:grid;grid-template-columns:200px 1fr;gap:0}
.product-card-img{padding:20px 16px;border-right:1px solid #e3dfdd;display:flex;align-items:flex-start;justify-content:center}
.product-card-img img{width:100%;max-width:180px;height:auto;border-radius:8px;object-fit:contain}
.product-card-specs{padding:16px 20px}
.spec-row{display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid #f0f0f0;gap:12px;font-size:.88rem}
.spec-row:last-of-type{border-bottom:none}
.spec-label{color:#555;flex:0 0 auto;max-width:55%}
.spec-val{color:#080E49;font-weight:500;text-align:right}
.spec-val.ok{color:#068D86}
.spec-val.no{color:#cc2200}
.spec-val.mid{color:#b36200}
.verdict-box{margin-top:14px;border-radius:8px;padding:14px 16px;font-size:.87rem;line-height:1.6}
.verdict-box.good{background:#e6f9f7;border-left:4px solid #068D86}
.verdict-box.mid{background:#fff8e6;border-left:4px solid #b36200}
.verdict-box.basic{background:#f5f5f5;border-left:4px solid #999}
.verdict-box strong{display:block;margin-bottom:4px}
.winner-banner{background:linear-gradient(135deg,#068D86,#080E49);color:#fff;border-radius:10px;padding:20px 24px;margin:32px 0;display:flex;align-items:center;gap:16px}
.winner-banner .trophy{font-size:2rem}
.winner-banner h3{color:#fff;margin:0 0 4px;font-size:1.1rem}
.winner-banner p{color:rgba(255,255,255,.85);margin:0;font-size:.88rem}
.product-imgs-row{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:24px 0}
.product-imgs-row figure{flex:1 1 140px;max-width:200px;text-align:center;margin:0}
.product-imgs-row img{width:100%;border-radius:8px;object-fit:contain}
@media(max-width:640px){
  .product-card-body{grid-template-columns:1fr}
  .product-card-img{border-right:none;border-bottom:1px solid #e3dfdd;padding:16px}
  .product-card-img img{max-width:140px}
  .spec-label{max-width:60%}
}
</style>
<link rel="icon" type="image/png" href="/img/favicon/favicon-96x96.png" sizes="96x96">
<link rel="apple-touch-icon" href="/img/favicon/apple-touch-icon.png">
<link rel="manifest" href="/img/favicon/site.webmanifest">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": ${JSON.stringify(title)},
      "description": ${JSON.stringify(desc)},
      "url": "${canonical}",
      "datePublished": "${a.date_published || ""}",
      "dateModified": "${a.date_modified || a.updated_at || ""}",
      "author": {"@type":"Person","name":"Team eCura","url":"https://www.ecura.it/chi-siamo/","worksFor":{"@type":"Organization","name":"Medica GB Srl","url":"https://www.ecura.it"}},
      "publisher": {"@type":"Organization","name":"eCura by Medica GB","logo":{"@type":"ImageObject","url":"https://www.ecura.it/img/logo.png","width":110,"height":36}},
      "image": {"@type":"ImageObject","url":"${esc(hero)}","width":1200,"height":630},
      "mainEntityOfPage": {"@type":"WebPage","@id":"${canonical}"},
      "inLanguage": "it-IT"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type":"ListItem","position":1,"name":"Home","item":"https://www.ecura.it/"},
        {"@type":"ListItem","position":2,"name":"Blog","item":"https://www.ecura.it/blog/"},
        {"@type":"ListItem","position":3,"name":${JSON.stringify(title)},"item":"${canonical}"}
      ]
    }
  ]
}
<\/script>
${faqSchemaBlock ? `<script type="application/ld+json">${faqSchemaBlock}<\/script>` : ""}
${howtoSchemaBlock ? `<script type="application/ld+json">${howtoSchemaBlock}<\/script>` : ""}
</head>
<body>
<a class="skip-link" href="#main-content">Salta al contenuto</a>
<div class="container-fluid" id="full_top_nav">
  <div class="container">
    <div class="full_top_nav_wrapper d-flex justify-content-between align-items-center">
      <a href="/" aria-label="eCura \u2014 home">
        <img src="/img/logo-ecura-trasp.png" alt="eCura logo" width="110" height="36" loading="eager">
      </a>
      <nav class="top_nav_wrapper" aria-label="Navigazione principale">
        <div class="top_nav">
          <ul class="top_Menu">
            <li><a href="/#heroSection">Cos'\xE8 eCura</a></li>
            <li><a href="/#whyEcura">Perch\xE9 eCura</a></li>
            <li><a href="/#pricingPlan">Prezzi</a></li>
            <li><a href="/blog/" class="active">Blog</a></li>
            <li><a href="/#faqAccordion">FAQ</a></li>
          </ul>
        </div>
      </nav>
      <a href="/#pricingPlan" class="cta-standard-green d-none d-md-inline-block">Scopri i Piani</a>
      <div id="hamburgerWrap" role="button" aria-label="Apri menu" aria-expanded="false" tabindex="0">
        <div id="hamburger"><span class="line"></span><span class="line"></span><span class="line"></span></div>
      </div>
    </div>
  </div>
</div>
<main id="main-content">
<div class="breadcrumb-wrap"><div class="container"><ol>
  <li><a href="/">Home</a></li><li><a href="/blog/">Blog</a></li>
  <li>${esc(title)}</li>
</ol></div></div>
<article class="article-wrap">
  <span class="tag" style="background:${esc(color)};color:#fff;padding:3px 12px;border-radius:20px;font-size:.8rem">${esc(cat)}</span>
  <h1 style="font-size:clamp(1.6rem,4vw,2.4rem);margin:16px 0 10px;color:#080E49">${esc(title)}</h1>
  <div class="article-meta">
    ${date ? `<span>&#128197; ${date}</span>` : ""}
    ${read ? `<span>&#9201; ${esc(read)}</span>` : ""}
    ${author ? `<span>&#9999; ${esc(author)}</span>` : ""}
  </div>
  <img src="${esc(hero)}" alt="${esc(heroAlt)}" class="article-hero-img" loading="eager" decoding="async"
    style="width:100%;height:auto;border-radius:10px;margin:20px 0 28px;display:block;object-fit:cover;aspect-ratio:16/8"
    onerror="this.src='/img/blog/default.jpg'">
  <div class="article-body">
    ${content}
  </div>
  <div class="article-cta">
    <h3>Proteggi i tuoi cari con eCura</h3>
    <p>Dispositivo medico certificato Classe IIA. GPS indoor+outdoor. Centrale operativa H24. Detraibile al 19%.</p>
    <a href="/#pricingPlan">Scopri i Piani eCura &rarr;</a>
  </div>
  <!-- E-E-A-T: sezione autore -->
  <div class="author-box" style="display:flex;align-items:flex-start;gap:18px;background:#f7f4ef;border-radius:12px;padding:22px 24px;margin:32px 0 8px;border-left:4px solid #068D86">
    <div style="flex-shrink:0;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#068D86,#080E49);display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:#fff">&#129489;</div>
    <div style="flex:1;min-width:0">
      <div style="font-weight:700;color:#080E49;font-size:.95rem;margin-bottom:2px">${esc(author)}</div>
      <div style="font-size:.8rem;color:#068D86;font-weight:600;margin-bottom:8px">Team eCura &mdash; Medica GB Srl</div>
      <p style="font-size:.84rem;color:#555;margin:0;line-height:1.6">Il contenuto di questo articolo \xE8 redatto e revisionato dal team eCura, composto da esperti di teleassistenza, dispositivi medici certificati (MDR Classe IIA) e sicurezza domestica per anziani. Medica GB Srl \xE8 produttore e distributore del bracciale eCura, con esperienza diretta nel settore assistenza anziani. Per approfondimenti scrivici a <a class="ecura-email" data-e="info@ecura.it" href="#" data-email="info" data-domain="ecura.it" onclick="this.href='mailto:'+this.dataset.email+'@'+this.dataset.domain;return true;" style="color:#068D86"></a>.</p>
      <div style="margin-top:10px;font-size:.78rem;color:#888">
        <span>&#x1F4C5; Pubblicato: ${date || "\u2014"}</span>
        ${read ? `&nbsp;&middot;&nbsp;<span>&#9201; ${esc(read)}</span>` : ""}
        &nbsp;&middot;&nbsp;<span>&#x2714; Verificato dal team eCura</span>
      </div>
    </div>
  </div>
</article>
${relatedSection}
</main>
<footer style="background:#080E49;color:#fff;padding:40px 0 24px;margin-top:64px;">
  <div class="container">
    <div class="row gy-3">
      <div class="col-md-4">
        <img src="/img/logo-ecura-trasp-w.png" alt="eCura logo" width="100" height="33" loading="lazy">
        <p style="font-size:.85rem;color:rgba(255,255,255,.7);margin-top:12px">Bracciale cadute anziani con GPS e teleassistenza H24.<br>Dispositivo medico certificato Classe IIA.</p>
      </div>
      <div class="col-md-4">
        <h4 style="font-size:.95rem;color:#fff;margin-bottom:12px">Pagine utili</h4>
        <ul style="list-style:none;padding:0;font-size:.85rem;">
          <li><a href="/" style="color:rgba(255,255,255,.7)">Home</a></li>
          <li><a href="/blog/" style="color:rgba(255,255,255,.7)">Blog eCura</a></li>
          <li><a href="/confronto-bracciali-anziani/" style="color:rgba(255,255,255,.7)">Confronto bracciali anziani</a></li>
          <li><a href="/bracciale-anziani-detraibile/" style="color:rgba(255,255,255,.7)">Bracciale anziani detraibile</a></li>
          <li><a href="/#faqAccordion" style="color:rgba(255,255,255,.7)">FAQ</a></li>
          <li style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.1)"><span style="font-size:.75rem;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.06em">Guide complete</span></li>
          <li><a href="/guida-cadute-anziani/" style="color:rgba(255,255,255,.7)">Guida cadute anziani</a></li>
          <li><a href="/guida-dispositivi-medici-teleassistenza/" style="color:rgba(255,255,255,.7)">Dispositivi medici &amp; detrazioni</a></li>
          <li><a href="/come-funziona-bracciale-ecura/" style="color:rgba(255,255,255,.7)">Come funziona il bracciale eCura</a></li>
        </ul>
      </div>
      <div class="col-md-4">
        <h4 style="font-size:.95rem;color:#fff;margin-bottom:12px">Contatti</h4>
        <p style="font-size:.85rem;color:rgba(255,255,255,.7)">Medica GB Srl<br>Corso Giuseppe Garibaldi 34<br>20121 Milano<br>
          <a href="tel:+393357301206" style="color:#068D86">+39 335 730 1206</a><br>
          <a class="ecura-email" data-e="info@ecura.it" href="#" data-email="info" data-domain="ecura.it" onclick="this.href='mailto:'+this.dataset.email+'@'+this.dataset.domain;return true;" style="color:#068D86"></a></p>
      </div>
    </div>
    <hr style="border-color:rgba(255,255,255,.15);margin:28px 0 16px">
    <p style="font-size:.78rem;color:rgba(255,255,255,.5);text-align:center;margin:0">
      &copy; 2026 Medica GB Srl &mdash; P.IVA 12524360964 &mdash; Tutti i diritti riservati.<br>
      eCura &egrave; un dispositivo medico Classe IIA ai sensi del Regolamento UE MDR 2017/745.
    </p>
  </div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer><\/script>
<script defer>
document.getElementById('hamburgerWrap').addEventListener('click',function(){
  var n=document.querySelector('.top_nav_wrapper');
  n.classList.toggle('is-active');
  this.setAttribute('aria-expanded', n.classList.contains('is-active'));
});
<\/script>

</body></html>`;
}
__name(renderArticle, "renderArticle");
function notFoundHtml(slug) {
  return `<!doctype html><html lang="it"><head><meta charset="utf-8">
<title>Articolo non trovato | eCura</title>
<link rel="stylesheet" href="/css/style.css">
</head><body>
<div style="text-align:center;padding:80px 20px">
  <h1>Articolo non trovato</h1>
  <p>L'articolo <em>${esc(slug)}</em> non esiste o non \xE8 ancora pubblicato.</p>
  <a href="/blog/">\u2190 Torna al Blog</a>
</div>
</body></html>`;
}
__name(notFoundHtml, "notFoundHtml");

// ../.wrangler/tmp/pages-jLHQQp/functionsRoutes-0.7796953849656336.mjs
var routes = [
  {
    routePath: "/api/admin/articles/:slug",
    mountPath: "/api/admin/articles",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/admin/articles",
    mountPath: "/api/admin",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/admin/auth",
    mountPath: "/api/admin",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/api/admin/password",
    mountPath: "/api/admin",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/submit-lead",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/submit-lead",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/blog/:slug",
    mountPath: "/blog",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  }
];

// ../../../../../opt/npm-cache/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../../opt/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
