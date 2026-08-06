/**
 * Admin Auth API
 * POST /api/admin/auth — login
 * GET  /api/admin/auth — check session
 * DELETE /api/admin/auth — logout
 */

// Simple PBKDF2-based password hashing using Web Crypto API
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

async function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

const COOKIE_NAME = 'ecura_admin_session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(part => {
    const [k, ...v] = part.trim().split('=');
    cookies[k.trim()] = v.join('=');
  });
  return cookies;
}

export async function onRequest({ request, env }) {
  const method = request.method;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const db = env.DB;

  // POST — Login
  if (method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders }); }

    const { username, password } = body;
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username e password richiesti' }), { status: 400, headers: corsHeaders });
    }

    const hash = await hashPassword(password);
    const user = await db.prepare('SELECT * FROM admin_users WHERE username = ? AND password_hash = ?').bind(username, hash).first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Credenziali non valide' }), { status: 401, headers: corsHeaders });
    }

    const token = await generateToken();
    const expires = new Date(Date.now() + SESSION_DURATION * 1000).toUTCString();

    // Store session in KV or D1
    await db.prepare('UPDATE admin_users SET last_login = datetime("now") WHERE id = ?').bind(user.id).run();
    // Store token in D1 sessions table
    await db.prepare('INSERT OR REPLACE INTO admin_sessions (token, user_id, expires_at) VALUES (?, ?, datetime("now", "+7 days"))').bind(token, user.id).run();

    const cookieValue = `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION}; Path=/`;
    return new Response(JSON.stringify({ ok: true, username: user.username }), {
      status: 200,
      headers: { ...corsHeaders, 'Set-Cookie': cookieValue }
    });
  }

  // GET — Check session
  if (method === 'GET') {
    const cookies = parseCookies(request.headers.get('Cookie'));
    const token = cookies[COOKIE_NAME];
    if (!token) return new Response(JSON.stringify({ authenticated: false }), { status: 401, headers: corsHeaders });

    const session = await db.prepare('SELECT s.*, u.username FROM admin_sessions s JOIN admin_users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")').bind(token).first();
    if (!session) return new Response(JSON.stringify({ authenticated: false }), { status: 401, headers: corsHeaders });

    return new Response(JSON.stringify({ authenticated: true, username: session.username }), { status: 200, headers: corsHeaders });
  }

  // DELETE — Logout
  if (method === 'DELETE') {
    const cookies = parseCookies(request.headers.get('Cookie'));
    const token = cookies[COOKIE_NAME];
    if (token) {
      await db.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run();
    }
    const clearCookie = `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`;
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Set-Cookie': clearCookie }
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
}
