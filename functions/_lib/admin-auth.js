/**
 * Helper condivisi per l'area admin (sessioni, password, header di sicurezza).
 * Questo file non esporta onRequest*, quindi non genera route.
 */

export const COOKIE_NAME = 'ecura_admin_session';
export const SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 giorni
const PBKDF2_ITERATIONS = 100000; // massimo consentito da Cloudflare Workers
const LEGACY_SALT = 'ecura-salt-2026'; // solo per verificare vecchi hash (poi aggiornati)

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(part => {
    const [k, ...v] = part.trim().split('=');
    if (k) cookies[k.trim()] = v.join('=');
  });
  return cookies;
}

export async function getSession(request, db) {
  const token = parseCookies(request.headers.get('Cookie'))[COOKIE_NAME];
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  return await db.prepare(
    'SELECT s.*, u.username FROM admin_sessions s JOIN admin_users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime("now")'
  ).bind(token).first();
}

const toHex = bytes => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
const fromHex = hex => new Uint8Array(hex.match(/../g).map(h => parseInt(h, 16)));

async function derive(password, saltBytes) {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return toHex(new Uint8Array(bits));
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Nuovo formato: pbkdf2$<iterazioni>$<salt esadecimale>$<hash esadecimale> con salt casuale per utente */
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${await derive(password, salt)}`;
}

/** Ritorna { ok, upgrade }: upgrade=true se l'hash e' nel vecchio formato (salt fisso) e va riscritto. */
export async function verifyPassword(password, stored) {
  if (!stored || stored === '__PENDING_SETUP__') return { ok: false, upgrade: false };
  if (stored.startsWith('pbkdf2$')) {
    const [, , saltHex, hashHex] = stored.split('$');
    if (!saltHex || !hashHex || !/^[0-9a-f]+$/.test(saltHex) || saltHex.length % 2) return { ok: false, upgrade: false };
    const calc = await derive(password, fromHex(saltHex));
    return { ok: timingSafeEqual(calc, hashHex), upgrade: false };
  }
  const calc = await derive(password, new TextEncoder().encode(LEGACY_SALT));
  const ok = timingSafeEqual(calc, stored);
  return { ok, upgrade: ok };
}

export function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

/** Richieste che modificano dati: l'Origin, se presente, deve coincidere con il sito. */
export function isCrossOriginWrite(request) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return false;
  const origin = request.headers.get('Origin');
  if (!origin) return false; // client non-browser: serve comunque la sessione (cookie SameSite=Strict)
  return origin !== new URL(request.url).origin;
}

export function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}

/** Header di sicurezza per tutte le risposte admin (pagine e API). */
export function withAdminHeaders(res) {
  const r = new Response(res.body, res);
  r.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  r.headers.set('X-Frame-Options', 'DENY');
  r.headers.set('Cache-Control', 'no-store');
  r.headers.set('Referrer-Policy', 'no-referrer');
  r.headers.delete('Access-Control-Allow-Origin');
  return r;
}
