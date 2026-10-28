/**
 * Admin Password Change API
 * POST /api/admin/password — cambia password (richiede sessione, verificata dal middleware)
 *
 * Il primo setup si fa direttamente su D1 (wrangler d1 execute), non via HTTP.
 */
import { getSession, hashPassword, verifyPassword, json } from '../../_lib/admin-auth.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const db = env.DB;
  const session = await getSession(request, db);
  if (!session) return json({ error: 'Non autorizzato' }, 401);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'JSON non valido' }, 400); }

  const { current_password, new_password } = body;
  if (typeof current_password !== 'string' || typeof new_password !== 'string' || !current_password || !new_password) {
    return json({ error: 'current_password e new_password richiesti' }, 400);
  }
  if (new_password.length < 10) return json({ error: 'La nuova password deve avere almeno 10 caratteri' }, 400);
  if (new_password.length > 256) return json({ error: 'Password troppo lunga' }, 400);

  const user = await db.prepare('SELECT * FROM admin_users WHERE id = ?').bind(session.user_id).first();
  const check = user ? await verifyPassword(current_password, user.password_hash) : { ok: false };
  if (!check.ok) return json({ error: 'Password corrente non valida' }, 401);

  await db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').bind(await hashPassword(new_password), session.user_id).run();
  // Invalida le altre sessioni dell'utente, mantiene quella corrente
  const token = (request.headers.get('Cookie') || '').match(/ecura_admin_session=([0-9a-f]{64})/)?.[1];
  if (token) await db.prepare('DELETE FROM admin_sessions WHERE user_id = ? AND token != ?').bind(session.user_id, token).run();
  return json({ success: true });
}
