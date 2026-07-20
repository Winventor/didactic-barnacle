# Beleidsdashboard OpenRaadsinformatie

Moderne, responsieve webapplicatie waarmee openbare beleidsdocumenten uit [OpenRaadsinformatie.nl](https://www.openraadsinformatie.nl) overzichtelijk kunnen worden doorzocht, gefilterd en geanalyseerd.

## Live website

**Open nu in je browser:** https://winventor.github.io/didactic-barnacle/

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Winventor/didactic-barnacle)

Klik op de knop hierboven voor een eigen URL op Render (bijv. `beleidsdashboard-openraadsinformatie.onrender.com`) — duurt ~2 minuten, geen domeinnaam nodig.

Voor een eigen domein (bijv. `beleidsdashboard.nl`) zie [DEPLOYMENT.md](./DEPLOYMENT.md).

## Functies

- **Dashboard** met statistieken en grafieken (Recharts)
- **Drie beleidslagen**: Beleidsvorming, Besluitvorming, Uitvoering & Evaluatie
- **Uitgebreide filters**: beleidslaag, documentsoort, bestuurslaag, organisatie, provincie, gemeente, waterschap, thema, status, portefeuillehouder, periode
- **Resultatentabel** met sortering, paginering, kolombeheer en verslepen (TanStack Table)
- **Detailpagina** per document met metadata en tekstfragmenten
- **Export** naar CSV, Excel en JSON
- **Donker/licht thema**
- **280 mockdocumenten** verdeeld over gemeenten, provincies en waterschappen

## Lokaal draaien

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) voor het beleidsdashboard.

---

## TES Labour Intelligence Platform (aparte website)

In dezelfde repository staat ook het **TES Labour Intelligence Platform** — een apart onderzoeksplatform voor arbeidsmarktprognoses en TES-analyse.

| Website | Route | Beschrijving |
|---------|-------|--------------|
| Beleidsdashboard | `/` | OpenRaadsinformatie beleidsdocumenten |
| TES Labour Intelligence | `/tes` | Arbeidsmarktprognoses en TES-analyse |
| Juridisch Onderzoeksplatform | `/juridisch` | NL/EU juridisch onderzoek en claimgeneratie |

**Juridisch platform starten:** [http://localhost:3000/juridisch](http://localhost:3000/juridisch)

Zie [docs/juridisch/README.md](docs/juridisch/README.md) voor installatie, API en bronnen.

**TES starten:** [http://localhost:3000/tes](http://localhost:3000/tes)

Demo-query: *Voorspel de ontwikkeling van zorgpersoneel in Drenthe.*

Zie [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) en [docs/DATABASE.md](docs/DATABASE.md) voor TES-architectuur.

## Techniek

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- shadcn/ui componenten + Lucide Icons
- TanStack Table + React Query
- Recharts voor visualisaties
