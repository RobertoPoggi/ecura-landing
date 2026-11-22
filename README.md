# eCura Landing — Cloudflare Pages

Replica della landing pubblica di ecura.it con form proprietario (no HubSpot).
I lead vengono inviati direttamente al CRM TeleMedCare.

## Stack
- HTML/CSS/JS vanilla — nessun framework, massima velocità
- Bootstrap 5.3 — layout responsive
- Cloudflare Pages Functions — backend serverless per il form
- Cloudflare Turnstile — CAPTCHA senza frizione

## Deploy
1. Push su GitHub → Cloudflare Pages si aggiorna automaticamente
2. Branch `main` = produzione (ecura.it)

## Env Vars (Cloudflare Pages → Settings → Variables)

| Variabile | Descrizione | Esempio |
|---|---|---|
| `CRM_ENDPOINT` | URL endpoint pubblico CRM | `https://telemedcare-v12.pages.dev/api/leads/public` |
| `CRM_API_KEY` | API key per autenticarsi al CRM | `your-secret-key` |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret | `0x4AAAA...` |
| `CORS_ORIGIN` | Origine CORS permessa | `https://www.ecura.it` |

## Claim DM (stato dei claim pubblicitari)

Ogni blocco di claim ha tre versioni in D1 (`claim_blocks`): ORIGINALE, TRANSITORIA, AUTORIZZATA. Lo **stato** lo decide il CRM TeleMedCare e viene replicato qui; i **testi** si modificano solo in `/admin/dashboard` ("Claim pubblicitari DM"), con motivo obbligatorio e revisioni ripristinabili.

**Render.** Le pagine con blocchi passano da una Pages Function (`functions/**/index.js` -> `functions/_lib/claim-render.js`), che legge solo D1. I template in `public/` contengono solo i marcatori `<!--claim:EC-XX-->...<!--/claim:EC-XX-->` attorno alla regione del blocco: i testi non sono nel codice. Nessuna logica lato client.

| Stato replicato | Testo emesso |
|---|---|
| ORIGINALE | `versione_originale`; se vuota il blocco non sostituisce nulla (resta il contenuto statico del template) |
| TRANSITORIA | `versione_transitoria`; se vuota nessun output |
| AUTORIZZATA | `versione_autorizzata`; se assente o non pubblicabile, TRANSITORIA |
| mancante o piu' vecchio di 24 h | TRANSITORIA (mai ORIGINALE per default) |

Il JSON-LD `MedicalDevice` / `Product` / `offers` e' emesso solo se EC-03 emette ORIGINALE. Il riferimento all'autorizzazione compare solo con `numero_provvedimento` e `data_autorizzazione` entrambi compilati (formato in `claim_config.formato_riferimento_autorizzazione`).

**Se D1 non risponde:** si serve l'ultima pagina buona dalla cache (fino a `stale_max_ore`, 24 h); senza cache, pagina di errore 503 neutra. Mai ORIGINALE, nessun messaggio al pubblico. Un purge fallito o non configurato imposta `purge_pending=1` e il purge successivo invalida tutte le pagine.

**Interruttore.** `CLAIM_RENDER_ATTIVO` (variabile Cloudflare Pages): assente o `0` = le pagine sono servite come file statici (senza marcatori), nessuna dipendenza da D1. Impostarlo a `1` solo dopo seed, secret e verifica su staging.

**Secret** (Cloudflare Pages): `CLAIM_SYNC_TOKEN` (CRM -> landing), `CF_ZONE_ID` e `CF_PURGE_TOKEN` (purge cache). Per la riconciliazione: `CRM_BASE_URL` e `CRM_CLAIM_TOKEN`.

**Endpoint interni** (Bearer `CLAIM_SYNC_TOKEN`): `POST /internal/claim-blocks/sync`, `GET /internal/claim-blocks/health`, `POST /internal/claim-blocks/purge`, `POST /internal/claim-blocks/riconcilia`.

**Seed e script** (`scripts/claim-dm/`): `seed.mjs` (tabella di controllo; con `--sql` scrive `docs/claim-dm/_private/seed.sql`, ignorato da git), `inserisci-marker.mjs`, `genera-blocchi.mjs`, `census.mjs`. ORIGINALE si estrae solo dallo snapshot live in `docs/claim-dm/snapshot-live-*`, mai dal campo `elemento_originale_rilevato` della matrice. Il seed e' idempotente: non tocca i blocchi gia' presenti. EC-02 e EC-06 non hanno ancora una regione mappata e restano inerti.

Seed di produzione (dopo il merge e dopo aver impostato i secret): `npx wrangler d1 execute ecura-landing-db --remote --file docs/claim-dm/_private/seed.sql`.

Test: `npm test`.

## Env Vars da aggiungere nell'HTML (build-time)
Sostituire `__TURNSTILE_SITE_KEY__` nell'HTML con la site key Turnstile pubblica.

## Struttura
```
public/
  index.html          ← Landing completa
  css/style.css       ← Stili fedeli all'originale
  js/main.js          ← Form submit, UTM, UI
  _headers            ← Security headers
  _redirects          ← index.php → /
functions/
  api/
    submit-lead.js    ← POST handler → CRM
wrangler.toml
```

## CRM — Endpoint pubblico richiesto
L'endpoint `POST /api/leads/public` deve essere abilitato su telemedcare-v12.pages.dev.
Vedi `CRM_ENDPOINT` nelle env vars.
