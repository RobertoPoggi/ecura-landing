/**
 * Admin Articles API — single article by slug
 * GET    /api/admin/articles/[slug]
 * PUT    /api/admin/articles/[slug]
 * DELETE /api/admin/articles/[slug]
 */

import { getSession, json } from '../../../_lib/admin-auth.js';
import { pingOnPublish, articleUrl } from '../../../_lib/indexnow.js';

export async function onRequest(context) {
  const { request, env, params } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });

  const db = env.DB;
  const session = await getSession(request, db);
  if (!session) return new Response(JSON.stringify({ error: 'Non autorizzato' }), { status: 401 });

  const slug = params.slug;
  if (!slug) return new Response(JSON.stringify({ error: 'Slug richiesto' }), { status: 400 });

  // GET single article
  if (request.method === 'GET') {
    const article = await db.prepare('SELECT * FROM blog_articles WHERE slug = ?').bind(slug).first();
    if (!article) return new Response(JSON.stringify({ error: 'Articolo non trovato' }), { status: 404 });
    return new Response(JSON.stringify({ article }), { status: 200 });
  }

  // PUT update article
  if (request.method === 'PUT') {
    let body;
    try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'JSON non valido' }), { status: 400 }); }

    const fields = [
      'title', 'description', 'category', 'tag_color', 'author',
      'date_published', 'read_time', 'hero_image', 'hero_image_alt',
      'summary', 'content',
      'related_1_slug', 'related_1_title', 'related_1_excerpt', 'related_1_tag',
      'related_2_slug', 'related_2_title', 'related_2_excerpt', 'related_2_tag',
      'related_3_slug', 'related_3_title', 'related_3_excerpt', 'related_3_tag',
      'status'
    ];
    const updates = [];
    const values = [];
    fields.forEach(f => {
      if (body[f] !== undefined) { updates.push(`${f} = ?`); values.push(body[f] || null); }
    });
    if (updates.length === 0) return new Response(JSON.stringify({ error: 'Nessun campo da aggiornare' }), { status: 400 });
    updates.push('date_modified = datetime("now")');
    updates.push('updated_at = datetime("now")');
    values.push(slug);

    // stato prima dell'UPDATE (serve a decidere il ping); se la lettura fallisce non si pinga e non si blocca nulla
    let wasPublished = false;
    try {
      const prev = await db.prepare('SELECT status FROM blog_articles WHERE slug = ?').bind(slug).first();
      wasPublished = !!prev && prev.status === 'published';
    } catch (e) { console.error('[IndexNow] lettura stato precedente fallita', e); }

    await db.prepare(`UPDATE blog_articles SET ${updates.join(', ')} WHERE slug = ?`).bind(...values).run();

    // IndexNow: solo se dopo l'UPDATE l'articolo e' pubblico e il contenuto e' cambiato / appena pubblicato.
    //  - status nel body = 'published'           -> ping
    //  - status nel body diverso (es. 'draft')   -> nessun ping
    //  - status non nel body, era gia' pubblicato -> ping (contenuto visibile cambiato)
    //  - status non nel body, era una bozza       -> nessun ping
    // Non puo' cambiare la risposta: pingOnPublish non lancia mai (try/catch, waitUntil, timeout 5 s).
    const shouldPing = body.status !== undefined ? body.status === 'published' : wasPublished;
    if (shouldPing) await pingOnPublish(context, [articleUrl(slug)]);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  // DELETE article
  if (request.method === 'DELETE') {
    const result = await db.prepare('DELETE FROM blog_articles WHERE slug = ?').bind(slug).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
}
