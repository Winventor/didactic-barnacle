# TES Labour Intelligence Platform v1.0

AI-ondersteund onderzoeksinstrument voor arbeid, loopbaan, carrière, leiderschap en duurzame inzetbaarheid.

## Kernprincipe

> **Statistische modellen doen de voorspelling.** AI legt de voorspelling uit. TES interpreteert de betekenis.

## Starten

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo-query

> Voorspel de ontwikkeling van zorgpersoneel in Drenthe.

Of klik op een voorbeeldvraag op de homepage.

## Architectuur

Zie [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) voor de volledige architectuurdocumentatie.

### Modules

| Module | Verantwoordelijkheid |
|--------|---------------------|
| `ForecastEngine` | Alle statistische voorspellingen |
| `AI Explanation Layer` | Uitleg met labels (Feit, Interpretatie, etc.) |
| `TES Interpretation Layer` | Kwalitatieve TES-analyse (6 componenten) |
| `Evidence Panel` | Bronnen, datasets, beperkingen |
| `Connector Registry` | CBS, UWV, SCP, NEA (+ gepland: DUO, Eurostat, ESCO) |

### Doelgroepen

- Beleidsmakers
- Werkgevers / HR
- Loopbaanprofessionals
- Onderzoekers

## Technologie

- Next.js 15, React 19, TypeScript
- Recharts voor interactieve visualisaties
- Tailwind CSS 4

## Licentie

Privé — TES Research Platform
