/**
 * Admin Articles API — list and create
 * GET  /api/admin/articles  — list all articles
 * POST /api/admin/articles  — create new article
 */

import { getSession, json } from '../../_lib/admin-auth.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });

  const db = env.DB;
  const session = await getSession(request, db);
  if (!session) return new Response(JSON.stringify({ error: 'Non autorizzato' }), { status: 401 });

  // GET — list all articles
  if (request.method === 'GET') {
    const { results } = await db.prepare(
      'SELECT id, slug, title, category, tag_color, date_published, read_time, status, hero_image, updated_at FROM blog_articles ORDER BY date_published DESC'
    ).all();
    return new Response(JSON.stringify({ articles: results || [] }), { status: 200 });
  }

  // POST — create new article
  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch {
      return new Response(JSON.stringify({ error: 'JSON non valido' }), { status: 400 });
    }

    const {
      slug, title, description, category, tag_color, author,
      date_published, read_time, hero_image, hero_image_alt,
      summary, content,
      related_1_slug, related_1_title, related_1_excerpt, related_1_tag,
      related_2_slug, related_2_title, related_2_excerpt, related_2_tag,
      related_3_slug, related_3_title, related_3_excerpt, related_3_tag
    } = body;

    if (!slug || !title) {
      return new Response(JSON.stringify({ error: 'Campi obbligatori: slug e title' }), { status: 400 });
    }

    try {
      await db.prepare(`
        INSERT INTO blog_articles (
          slug, title, description, category, tag_color, author,
          date_published, date_modified, read_time, hero_image, hero_image_alt,
          summary, content,
          related_1_slug, related_1_title, related_1_excerpt, related_1_tag,
          related_2_slug, related_2_title, related_2_excerpt, related_2_tag,
          related_3_slug, related_3_title, related_3_excerpt, related_3_tag,
          status, updated_at
        ) VALUES (?,?,?,?,?,?,?,datetime('now'),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'published',datetime('now'))
      `).bind(
        slug, title, description || '', category || 'Informazione',
        tag_color || '#068D86', author || 'Redazione eCura',
        date_published,
        read_time || '5 min lettura',
        hero_image || '/img/blog/default.jpg',
        hero_image_alt || '', summary || '', content,
        related_1_slug || null, related_1_title || null, related_1_excerpt || null, related_1_tag || null,
        related_2_slug || null, related_2_title || null, related_2_excerpt || null, related_2_tag || null,
        related_3_slug || null, related_3_title || null, related_3_excerpt || null, related_3_tag || null
      ).run();
      return new Response(JSON.stringify({ ok: true, slug }), { status: 201 });
    } catch (e) {
      if (e.message && e.message.includes('UNIQUE')) {
        return new Response(JSON.stringify({ error: 'Slug già esistente. Scegli uno slug diverso.' }), { status: 409 });
      }
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
}
