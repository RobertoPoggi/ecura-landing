# Snapshot LIVE pre-intervento (prompt Claim DM, §9.1)

- Estratto il 2026-11-22T11:20:45Z con `curl` dall'HTML pubblico di https://www.ecura.it (tutte le URL di `sitemap.xml`, 34 pagine, HTTP 200).
- `MANIFEST.txt`: SHA-256 (primi 16 caratteri), codice HTTP, byte, URL di ogni pagina.
- Contenuto gia' pubblico: nessun dato riservato. Serve come (a) rollback target, (b) prova dello stato pre-intervento, (c) base del confronto prima/dopo.
- Le differenze con `public/` sono solo i marcatori `<!--email_off-->`, rimossi da Cloudflare quando serve la pagina.
- Questo e' lo snapshot per PAGINA intera. L'estrazione per BLOCCO (`versione_originale` in D1) parte da qui, nella fase di seeding.
