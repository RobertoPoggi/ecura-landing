/**
 * POST /internal/claim-blocks/riconcilia  (invocato dal job periodico, ogni 15 minuti)
 * Chiama GET {CRM_BASE_URL}/api/claim-block-states (token server-to-server) e allinea la replica D1:
 * recupera i webhook persi e rinfresca stato_replicato_at (alimenta l'health check).
 * Se il CRM non risponde NON modifica nulla: la replica invecchia e, oltre la freschezza, scatta il fail-closed.
 */
import { checkServerToken, applicaStato, purgeGestito, purgePending } from '../../_lib/claim-blocks.js';
import { internalJson } from '../../_lib/claim-http.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return internalJson({ error: 'Method not allowed' }, 405);
  const auth = checkServerToken(request, env);
  if (!auth.ok) return internalJson({ error: auth.error }, auth.status);
  if (!env.DB) return internalJson({ error: 'D1 non disponibile' }, 503);
  if (!env.CRM_BASE_URL || !env.CRM_CLAIM_TOKEN) return internalJson({ error: 'CRM_BASE_URL / CRM_CLAIM_TOKEN non configurati' }, 503);

  let stati;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(`${String(env.CRM_BASE_URL).replace(/\/+$/, '')}/api/claim-block-states`, {
      headers: { Authorization: `Bearer ${env.CRM_CLAIM_TOKEN}` }, signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!r.ok) return internalJson({ ok: false, crm_raggiungibile: false, status: r.status }, 502);
    stati = await r.json();
  } catch (e) {
    return internalJson({ ok: false, crm_raggiungibile: false }, 502);
  }
  const lista = Array.isArray(stati) ? stati : (stati && Array.isArray(stati.states) ? stati.states : null);
  if (!lista) return internalJson({ ok: false, errore: 'risposta CRM non valida' }, 502);

  const esiti = { applicato: 0, invariato: 0, obsoleto: 0, rifiutato: 0 };
  const daPurgare = [];
  try {
    for (const ev of lista) {
      const r = await applicaStato(env.DB, ev, 'riconciliazione');
      esiti[r.ok ? r.esito : 'rifiutato']++;
      if (r.ok && r.cambiato) daPurgare.push(...r.pagine);
    }
    const purge = (daPurgare.length || await purgePending(env.DB)) ? await purgeGestito(env.DB, env, daPurgare) : null;
    return internalJson({ ok: true, crm_raggiungibile: true, esiti, purge });
  } catch (e) {
    console.error('[claim-dm] riconciliazione fallita', e && e.message);
    return internalJson({ error: 'Errore interno' }, 500);
  }
}
