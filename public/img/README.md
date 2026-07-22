# Archivio Immagini eCura

Tutte le immagini del sito, del blog e delle campagne pubblicitarie.

---

## 📁 Struttura cartelle

```
public/img/
├── README.md              ← questo file
├── brand/                 ← immagini originali da ecura.it (massima risoluzione)
│   ├── screen/            ← screenshot app SiDLY CARE
│   └── ...
├── blog/                  ← immagini AI generate per articoli blog (16:9, 1376×768)
├── ads/                   ← screenshot annunci Facebook/Instagram/Google Ads
├── favicon/               ← favicon e icone PWA
└── screen/                ← screenshot app (symlink storico)
```

---

## 📸 Brand — `brand/`

Immagini originali scaricate da www.ecura.it alla massima risoluzione disponibile.

| File | Dimensioni | Peso | Descrizione |
|------|-----------|------|-------------|
| `hero-lg.jpg` | 1500×970 | 69KB | Hero principale landing page — donna anziana con bracciale |
| `protezione-anziani.jpg` | 1920×1018 | 1.3MB | Foto editoriale — coppia anziani, protezione e serenità |
| `perche-ci-scelgono.jpg` | 1920×854 | 1.4MB | Foto editoriale — anziana felice con caregiver |
| `anziano-in-difficolta.jpg` | 767×547 | 327KB | Foto concettuale — anziano in difficoltà a casa |
| `set-smart-watch.jpg` | 1114×440 | 222KB | Product shot — bracciale SiDLY CARE + accessori |
| `sidly-front.jpg` | 1000×1000 | 27KB | Product shot quadrato — bracciale SiDLY CARE fronte |
| `SidLy.gif` | — | 3.9MB | Animazione GIF prodotto SiDLY CARE |
| `logo-ecura-trasp.png` | — | 11KB | Logo eCura trasparente (per sfondi chiari) |
| `logo-ecura-trasp-w.png` | — | 12KB | Logo eCura trasparente bianco (per sfondi scuri) |
| `certificazione.png` | — | 10KB | Badge certificazione Classe IIA |
| `certification-full.png` | — | 44KB | Badge certificazione completo con testo |
| `trustpilot.png` | — | 58KB | Badge Trustpilot |

### Schermate app — `brand/screen/`

Screenshot dell'app SiDLY CARE (interfaccia in inglese).

| File | Descrizione |
|------|-------------|
| `Ekran-leki-menu-EN.jpg` | Schermata farmaci / promemoria |
| `Lokalizacja-EN.jpg` | Schermata localizzazione GPS |
| `Pogoda-EN.jpg` | Schermata meteo |
| `Pomiar-menu-EN.jpg` | Menu misurazioni parametri vitali |
| `Pomiary-podsumowanie-EN.jpg` | Riepilogo misurazioni |
| `Wykryto-upadek-EN.jpg` | Alert rilevamento caduta |

---

## 🤖 Blog AI — `blog/`

Immagini generate con AI (nano-banana-2-flash-lite) in stile ecura.it.
Formato: **16:9 — 1376×768px — JPEG**

| File | Articolo |
|------|----------|
| `anziano-solo-casa.jpg` | Anziano solo in casa: soluzioni sicurezza 2026 |
| `badante-vs-teleassistenza.jpg` | Badante vs Teleassistenza: costi 2026 |
| `bracciale-detraibile.jpg` | Bracciale detraibile 19%: guida fiscale |
| `cadute-anziani.jpg` | Cadute anziani in casa: statistiche e prevenzione |
| `centrale-operativa-h24.jpg` | Centrale Operativa H24: come funziona |
| `dispositivo-medico-iia.jpg` | Dispositivo Medico Classe IIA: cosa significa |
| `ecura-vs-seremy.jpg` | eCura vs Seremy 2026: confronto |
| `gps-indoor-anziani.jpg` | GPS anziani indoor: come funziona |
| `guida-bracciali-cadute.jpg` | Guida bracciali cadute anziani 2026 |
| `prevenzione-cadute.jpg` | Prevenzione cadute: 10 consigli pratici |
| `sidly-recensioni.jpg` | SiDLY CARE recensioni clienti eCura |
| `teleassistenza-come-funziona.jpg` | Teleassistenza anziani: come funziona e costi |

---

## 📢 Annunci — `ads/`

Screenshot e creatività degli annunci Facebook/Instagram Reels e Google Ads.
Formato originale: **9:16 verticale — ~1080×2400px** (screenshot da mobile)

| File | Canale | Descrizione | Data |
|------|--------|-------------|------|
| `ad-reels-bracciale-smart-v1.jpg` | FB/IG Reels | Composizione: donna anziana + render 3D bracciale + CTA verde "RICHIEDI UN PREVENTIVO OGGI" | lug 2026 |
| `ad-reels-bracciale-smart-v2.jpg` | FB/IG Reels | Identico a v1 (variante con engagement diverso: 295 like) | lug 2026 |
| `ad-reels-mani-anziana-v1.jpg` | FB/IG Reels | Sfondo foto mani anziana + testo sovrapposto + render bracciale piccolo | lug 2026 |
| `ad-reels-landing-overlay-v1.jpg` | FB/IG Reels | Overlay landing page "Vuoi saperne di più?" — schermata post-click | lug 2026 |

### Come aggiungere nuovi annunci

1. Salva lo screenshot nella cartella `ads/`
2. Usa la convenzione di nome: `ad-{canale}-{descrizione}-v{n}.{ext}`
   - Canali: `reels`, `feed`, `story`, `google-display`, `google-search`
   - Esempi: `ad-feed-anziana-sorridente-v1.jpg`, `ad-google-display-banner-v1.png`
3. Aggiungi la riga alla tabella qui sopra
4. `git add public/img/ads/ && git commit -m "feat(ads): aggiungi creatività {descrizione}"`

---

## 🔧 Note tecniche

- **Ottimizzazione**: Le immagini blog sono già ottimizzate (93–184KB). Le brand photos sono in full-res per uso in campagne ads (ritaglio, resize in post-produzione).
- **Licenze**: Le immagini in `brand/` e `ads/` sono proprietà di Medica GB Srl. Le immagini in `blog/` sono generate con AI (nano-banana-2-flash-lite) con prompt originali — uso commerciale consentito.
- **Aggiornamento**: Per aggiornare un'immagine brand, sostituisci il file mantenendo lo stesso nome. Cloudflare Pages invalida la cache automaticamente al deploy.
