/**
 * GET  /api/admin/claim-blocks/[id]   - blocco completo (tre versioni, provvedimento) + cronologia revisioni
 * PUT  /api/admin/claim-blocks/[id]   - salva testi / provvedimento: motivo obbligatorio, una revisione per campo cambiato, poi purge
 * POST /api/admin/claim-blocks/[id]   - { azione: "ripristina", revisione_id, motivo }: ripristino revisionato, poi purge
 * Stessa autenticazione degli articoli del blog (sessione admin). Lo STATO non si cambia da qui.
 */
import { getSession, json } from '../../../_lib/admin-auth.js';
import { BLOCK_ID_RE, salvaBlocco, ripristinaRevisione, purgeGestito, avvisiBlocco } from '../../../_lib/claim-blocks.js';

export async function onRequest({ request, env, params }) {
  const id = String(params.id || '');
  if (!BLOCK_ID_RE.test(id)) return json({ error: 'block_id non valido' }, 400);
  const session = await getSession(request, env.DB);
  if (!session) return json({ error: 'Non autorizzato' }, 401);
  const autore = session.username;

  try {
    if (request.method === 'GET') {
      const block = await env.DB.prepare('SELECT * FROM claim_blocks WHERE block_id = ?').bind(id).first();
      if (!block) return json({ error: 'Blocco non trovato' }, 404);
      block.pagine = JSON.parse(block.pagine || '[]');
      const avvisi = avvisiBlocco(block);
      const { results } = await env.DB.prepare(
        'SELECT id, campo, testo_precedente, testo_nuovo, autore, creato_at, motivo, tipo, ripristina_revisione_id FROM claim_blocks_revisions WHERE block_id = ? ORDER BY id DESC LIMIT 200'
      ).bind(id).all();
      return json({ block, revisioni: results || [], avvisi });
    }

    let body;
    try { body = await request.json(); } catch { return json({ error: 'JSON non valido' }, 400); }

    let r;
    if (request.method === 'PUT') r = await salvaBlocco(env.DB, id, body, autore);
    else if (request.method === 'POST' && body.azione === 'ripristina') {
      const revId = Number(body.revisione_id);
      if (!Number.isInteger(revId) || String(body.motivo || '').trim() === '') return json({ error: 'revisione_id e motivo obbligatori' }, 400);
      r = await ripristinaRevisione(env.DB, id, revId, body.motivo, autore);
    } else return json({ error: 'Method not allowed' }, 405);

    if (!r.ok) return json({ error: r.error }, r.status);
    const purge = r.cambiati && r.cambiati.length ? await purgeGestito(env.DB, env, r.pagine) : null;
    return json({ ok: true, cambiati: r.cambiati, purge });
  } catch (e) {
    console.error('[claim-dm] admin blocco fallito', e && e.message);
    return json({ error: 'Errore interno' }, 500);
  }
}
