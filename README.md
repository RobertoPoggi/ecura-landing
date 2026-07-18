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
