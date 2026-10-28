/**
 * Admin Articles API — single article by slug
 * GET    /api/admin/articles/[slug]
 * PUT    /api/admin/articles/[slug]
 * DELETE /api/admin/articles/[slug]
 */

import { getSession, json } from '../../../_lib/admin-auth.js';

export async function onRequest({ request, env, params }) {
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

    await db.prepare(`UPDATE blog_articles SET ${updates.join(', ')} WHERE slug = ?`).bind(...values).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  // DELETE article
  if (request.method === 'DELETE') {
    const result = await db.prepare('DELETE FROM blog_articles WHERE slug = ?').bind(slug).run();
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
}
