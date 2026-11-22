/**
 * GET /api/admin/claim-blocks  - elenco dei blocchi (stato replicato in SOLA LETTURA) + health di sincronizzazione.
 * Sessione admin richiesta dal middleware /api/admin. Il selettore dello stato NON e' qui: e' solo nel CRM.
 */
import { json } from '../../_lib/admin-auth.js';
import { calcolaHealth, risolviBlocco, leggiConfig } from '../../_lib/claim-blocks.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  try {
    const now = new Date();
    const cfg = await leggiConfig(env.DB);
    const { results } = await env.DB.prepare(
      `SELECT block_id, titolo, pagine, stato_replicato, stato_replicato_at, updated_by, updated_at,
              (versione_autorizzata IS NOT NULL AND versione_autorizzata <> '') AS ha_autorizzata,
              (versione_transitoria <> '') AS ha_transitoria
         FROM claim_blocks ORDER BY block_id`
    ).all();
    const blocchi = (results || []).map(r => ({
      ...r, pagine: JSON.parse(r.pagine || '[]'),
      stato_effettivo: risolviBlocco({ ...r, versione_originale: '', versione_transitoria: r.ha_transitoria ? 'x' : '', versione_autorizzata: r.ha_autorizzata ? 'x' : null }, now, cfg).stato_effettivo,
    }));
    return json({ blocchi, health: await calcolaHealth(env.DB, now), config: { require_provvedimento_for_autorizzata: cfg.requireProvvedimento, freschezza_ore: cfg.freschezzaOre } });
  } catch (e) {
    console.error('[claim-dm] elenco fallito', e && e.message);
    return json({ error: 'Errore interno' }, 500);
  }
}
