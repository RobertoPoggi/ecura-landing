/**
 * Protegge tutte le API /api/admin/*: serve una sessione valida
 * (tranne /api/admin/auth, che gestisce login/logout/verifica sessione).
 * Blocca inoltre le scritture cross-origin e imposta header di sicurezza.
 */
import { getSession, isCrossOriginWrite, json, withAdminHeaders } from '../../_lib/admin-auth.js';

export async function onRequest({ request, env, next }) {
  const path = new URL(request.url).pathname.replace(/\/+$/, '');

  if (isCrossOriginWrite(request)) {
    return withAdminHeaders(json({ error: 'Origine non consentita' }, 403));
  }

  if (path !== '/api/admin/auth' && request.method !== 'OPTIONS') {
    let session = null;
    try { session = await getSession(request, env.DB); } catch { session = null; }
    if (!session) return withAdminHeaders(json({ error: 'Non autorizzato' }, 401));
  }
  return withAdminHeaders(await next());
}
