/**
 * Protegge tutte le pagine /admin/*: senza sessione valida si viene
 * rimandati alla pagina di login (l'HTML della dashboard non e' piu' pubblico).
 */
import { getSession, withAdminHeaders } from '../_lib/admin-auth.js';

export async function onRequest({ request, env, next }) {
  const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
  const isLogin = path === '/admin/login.html' || path === '/admin/login';

  let session = null;
  try { session = await getSession(request, env.DB); } catch { session = null; } // in caso di errore: chiuso

  if (!session && !isLogin) {
    return withAdminHeaders(new Response(null, { status: 302, headers: { Location: '/admin/login.html' } }));
  }
  return withAdminHeaders(await next());
}
