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

Open [http://localhost:3000](http://localhost:3000).

## Techniek

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- shadcn/ui componenten + Lucide Icons
- TanStack Table + React Query
- Recharts voor visualisaties
- Modulaire datalaag (mock provider, Supabase-ready types)

## Architectuur

```
src/
├── app/                    # Pagina's (dashboard + detail)
├── components/             # UI-componenten
│   ├── dashboard/          # Statistieken en grafieken
│   ├── documents/          # Tabel, tabs, detail
│   ├── filters/            # Filterbalk
│   ├── layout/             # Header, thema
│   └── ui/                 # shadcn/ui basis
├── hooks/                  # React Query + filter hooks
├── lib/
│   ├── classification/     # Automatische beleidslaag-classificatie
│   ├── constants/          # Documentsoorten, thema's, organisaties
│   ├── data/               # Data provider (mock → API/Supabase)
│   ├── export/             # CSV, Excel, JSON export
│   ├── filters/            # Filterlogica
│   └── stats/              # Statistieken en grafiekdata
└── types/                  # TypeScript interfaces
```

## Toekomstige uitbreidingen

De code is voorbereid op:

- API-koppeling OpenRaadsinformatie
- Scraper
- Supabase database
- Elasticsearch
- AI-samenvattingen, classificatie en chat
- Favorieten, tags, notities en dossierbewaking

## Deployment

### GitHub Pages

```bash
GITHUB_PAGES=true npm run build
```

### Render.com

Zie `render.yaml` voor blueprint-configuratie.
