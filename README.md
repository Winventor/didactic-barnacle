# Raadsinformatie Overzicht

Webapplicatie voor het doorzoeken van **moties**, **amendementen** en **schriftelijke vragen** uit de [Open Raadsinformatie](https://www.openraadsinformatie.nl) API.

## Functies

- Overzichtstabel met type, onderwerp, status (aangenomen/verworpen), indienende partijen, datum en gemeente
- Filters op type, status, gemeente en vrije zoekterm
- Links naar brondata op `id.openraadsinformatie.nl` en het PDF-bestand
- Data uit meer dan 300 gemeenten via de Elasticsearch API

## Online gebruiken

### GitHub Pages (aanbevolen)

De app staat klaar op de `gh-pages` branch. Activeer GitHub Pages **eenmalig**:

1. Open [Repository Settings → Pages](https://github.com/Winventor/didactic-barnacle/settings/pages)
2. Bij **Build and deployment** kies **Deploy from a branch**
3. Branch: `gh-pages` · Folder: `/ (root)`
4. Klik **Save**

Na 1–2 minuten is de app bereikbaar op:

**https://winventor.github.io/didactic-barnacle/**

Bij elke push naar `master` wordt de site automatisch opnieuw gebouwd via GitHub Actions.

### Alternatief: Render.com

1. Maak een account op [Render](https://render.com)
2. Klik op **New → Blueprint** en koppel deze GitHub-repository
3. Render leest `render.yaml` en publiceert de app op een eigen URL


```bash
npm install
npm run dev
```

## Lokaal draaien

- Next.js 15 (App Router)
- TypeScript + Tailwind CSS
- Open Raadsinformatie Elasticsearch API: `https://api.openraadsinformatie.nl/v1/elastic/`

Open [http://localhost:3000](http://localhost:3000).

## Techniek

De app haalt gegevens op uit de Open Raadsinformatie API van de Open State Foundation. Status en partijen worden afgeleid uit beschikbare metadata en documenttekst waar mogelijk.
