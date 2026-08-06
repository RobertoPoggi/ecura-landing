/**
 * Admin Password Change API
 * POST /api/admin/password — change password
 * POST /api/admin/password?setup=1 — initial setup (no auth required if password is __PENDING_SETUP__)
 */

const COOKIE_NAME = 'ecura_admin_session';

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(part => {
    const [k, ...v] = part.trim().split('=');
    cookies[k.trim()] = v.join('=');
  });
  return cookies;
}

async function hashPassword(password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode('ecura-salt-2026'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkAuth(request, db) {
  const cookies = parseCookies(request.headers.get('Cookie'));
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  const session = await db.prepare(
    'SELECT s.*, u.username FROM admin_sessions s JOIN admin_users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")'
  ).bind(token).first();
  return session || null;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });

  const db = env.DB;
  const url = new URL(request.url);
  const isSetup = url.searchParams.get('setup') === '1';

  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'JSON non valido' }), { status: 400, headers: corsHeaders }); }

  if (isSetup) {
    // Initial setup: check if still pending
    const user = await db.prepare("SELECT * FROM admin_users WHERE username = 'admin'").first();
    if (!user) return new Response(JSON.stringify({ error: 'Admin non trovato' }), { status: 404, headers: corsHeaders });
    if (user.password_hash !== '__PENDING_SETUP__') {
      return new Response(JSON.stringify({ error: 'Setup già completato. Usa il cambio password normale.' }), { status: 403, headers: corsHeaders });
    }
    const { new_password } = body;
    if (!new_password || new_password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password deve essere di almeno 8 caratteri' }), { status: 400, headers: corsHeaders });
    }
    const hash = await hashPassword(new_password);
    await db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').bind(hash, 'admin').run();
    return new Response(JSON.stringify({ ok: true, message: 'Password impostata. Ora puoi fare login.' }), { status: 200, headers: corsHeaders });
  }

  // Normal password change — requires auth
  const session = await checkAuth(request, db);
  if (!session) return new Response(JSON.stringify({ error: 'Non autorizzato' }), { status: 401, headers: corsHeaders });

  const { current_password, new_password } = body;
  if (!current_password || !new_password) {
    return new Response(JSON.stringify({ error: 'current_password e new_password richiesti' }), { status: 400, headers: corsHeaders });
  }
  if (new_password.length < 8) {
    return new Response(JSON.stringify({ error: 'Nuova password deve essere di almeno 8 caratteri' }), { status: 400, headers: corsHeaders });
  }

  const currentHash = await hashPassword(current_password);
  const user = await db.prepare('SELECT * FROM admin_users WHERE id = ? AND password_hash = ?').bind(session.user_id, currentHash).first();
  if (!user) return new Response(JSON.stringify({ error: 'Password corrente non valida' }), { status: 401, headers: corsHeaders });

  const newHash = await hashPassword(new_password);
  await db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').bind(newHash, session.user_id).run();
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
}
