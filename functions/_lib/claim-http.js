/** Risposte HTTP per gli endpoint interni Claim DM: mai indicizzabili, mai in cache, nessun dato di testo. */
export function internalJson(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}
