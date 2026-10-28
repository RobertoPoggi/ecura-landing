/**
 * Admin Auth API
 * POST   /api/admin/auth — login (con limite ai tentativi)
 * GET    /api/admin/auth — verifica sessione
 * DELETE /api/admin/auth — logout
 *
 * Solo same-origin (nessun CORS). Header di sicurezza aggiunti da _middleware.js.
 */
import {
  COOKIE_NAME, SESSION_SECONDS, getSession, parseCookies,
  hashPassword, verifyPassword, clientIp, json,
} from '../../_lib/admin-auth.js';

const MAX_FAILS_PER_IP = 5;      // tentativi falliti per IP...
const MAX_FAILS_PER_USER = 10;   // ...e per utente (contro attacchi distribuiti)
const WINDOW_MINUTES = 15;       // ...in questa finestra: poi blocco

function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

const cookie = (value, maxAge) =>
  `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`;

export async function onRequest({ request, env }) {
  const method = request.method;
  const db = env.DB;

  if (method === 'OPTIONS') return new Response(null, { status: 204 });

  // POST — Login
  if (method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

    const username = typeof body.username === 'string' ? body.username.trim().slice(0, 64) : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!username || !password || password.length > 256) {
      return json({ error: 'Username e password richiesti' }, 400);
    }

    const ip = clientIp(request);

    // Pulizia vecchi tentativi + controllo blocco
    await db.prepare(`DELETE FROM admin_login_attempts WHERE created_at < datetime('now', '-1 day')`).run();
    const win = `-${WINDOW_MINUTES} minutes`;
    const byIp = await db.prepare(`SELECT COUNT(*) AS n FROM admin_login_attempts WHERE ip = ? AND created_at > datetime('now', ?)`).bind(ip, win).first();
    const byUser = await db.prepare(`SELECT COUNT(*) AS n FROM admin_login_attempts WHERE username = ? AND created_at > datetime('now', ?)`).bind(username, win).first();
    if ((byIp?.n || 0) >= MAX_FAILS_PER_IP || (byUser?.n || 0) >= MAX_FAILS_PER_USER) {
      return json({ error: `Troppi tentativi falliti. Riprova tra ${WINDOW_MINUTES} minuti.` }, 429, { 'Retry-After': String(WINDOW_MINUTES * 60) });
    }

    const user = await db.prepare('SELECT * FROM admin_users WHERE username = ?').bind(username).first();
    // Se l'utente non esiste si esegue comunque un calcolo, per non rivelare quali username esistono
    const check = await verifyPassword(password, user ? user.password_hash : 'pbkdf2$100000$00$00');

    if (!user || !check.ok) {
      await db.prepare('INSERT INTO admin_login_attempts (ip, username) VALUES (?, ?)').bind(ip, username).run();
      return json({ error: 'Credenziali non valide' }, 401);
    }

    // Login riuscito: azzera i tentativi di questo IP/utente, aggiorna l'hash se in formato vecchio
    await db.prepare('DELETE FROM admin_login_attempts WHERE ip = ? OR username = ?').bind(ip, username).run();
    if (check.upgrade) {
      await db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').bind(await hashPassword(password), user.id).run();
    }

    const token = generateToken();
    await db.prepare(`UPDATE admin_users SET last_login = datetime('now') WHERE id = ?`).bind(user.id).run();
    await db.prepare(`DELETE FROM admin_sessions WHERE expires_at < datetime('now')`).run();
    await db.prepare(`INSERT INTO admin_sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))`).bind(token, user.id).run();

    return json({ ok: true, username: user.username }, 200, { 'Set-Cookie': cookie(token, SESSION_SECONDS) });
  }

  // GET — Check session
  if (method === 'GET') {
    const session = await getSession(request, db);
    if (!session) return json({ authenticated: false }, 401);
    return json({ authenticated: true, username: session.username });
  }

  // DELETE — Logout
  if (method === 'DELETE') {
    const token = parseCookies(request.headers.get('Cookie'))[COOKIE_NAME];
    if (token) await db.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run();
    return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
  }

  return json({ error: 'Method not allowed' }, 405);
}
