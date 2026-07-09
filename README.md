# Raadsinformatie Overzicht

Webapplicatie voor het doorzoeken van **moties**, **amendementen** en **schriftelijke vragen** uit de [Open Raadsinformatie](https://www.openraadsinformatie.nl) API.

## Functies

- Overzichtstabel met type, onderwerp, status (aangenomen/verworpen), indienende partijen, datum en gemeente
- Filters op type, status, gemeente en vrije zoekterm
- Links naar brondata op `id.openraadsinformatie.nl` en het PDF-bestand
- Data uit meer dan 300 gemeenten via de Elasticsearch API

## Lokaal draaien

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Techniek

- Next.js 15 (App Router)
- TypeScript + Tailwind CSS
- Open Raadsinformatie Elasticsearch API: `https://api.openraadsinformatie.nl/v1/elastic/`

## Data

De app haalt gegevens op uit de Open Raadsinformatie API van de Open State Foundation. Status en partijen worden afgeleid uit beschikbare metadata en documenttekst waar mogelijk.
