# Raadsinformatie Overzicht

Webapplicatie voor het doorzoeken van **moties**, **amendementen** en **schriftelijke vragen** uit de [Open Raadsinformatie](https://www.openraadsinformatie.nl) API.

## Functies

- Overzichtstabel met type, onderwerp, status (aangenomen/verworpen), indienende partijen, datum en gemeente
- Filters op type, status, gemeente en vrije zoekterm
- Links naar brondata op `id.openraadsinformatie.nl` en het PDF-bestand
- Data uit meer dan 300 gemeenten via de Elasticsearch API

## Online gebruiken

### GitHub Pages

De app wordt automatisch gedeployed via GitHub Actions bij elke push naar `master`.

**Live URL:** https://winventor.github.io/didactic-barnacle/

Als Pages nog niet is ingeschakeld, kies bij [Settings → Pages](https://github.com/Winventor/didactic-barnacle/settings/pages) **GitHub Actions** als bron (of voer `./scripts/enable-github-pages.sh` uit).

### Alternatief: Render.com

1. Maak een account op [Render](https://render.com)
2. Klik op **New → Blueprint** en koppel deze GitHub-repository
3. Render leest `render.yaml` en publiceert de app op een eigen URL

## Lokaal draaien

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Techniek

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Statische export voor GitHub Pages (`GITHUB_PAGES=true npm run build`)
- Open Raadsinformatie Elasticsearch API: `https://api.openraadsinformatie.nl/v1/elastic/`

De app haalt gegevens op uit de Open Raadsinformatie API van de Open State Foundation. Status en partijen worden afgeleid uit beschikbare metadata en documenttekst waar mogelijk.
