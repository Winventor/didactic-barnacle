# Architectuur — Schemer en Nacht

## 1. Eisenanalyse

De applicatie moet op verzoek een geldige iCalendar-feed (`.ics`) genereren voor een geografische locatie. De feed bevat voor elke logische nacht drie aaneengesloten perioden (avondschemer → nacht → ochtendschemer), over een voortschrijdend venster van 1 kalendermaand terug tot 1 kalenderjaar vooruit.

Kernvoorwaarden:

- volledig stateless (alleen `lat`, `lon`, huidige datum);
- abonneerbaar via URL (geen eenmalige download);
- IANA-tijdzone `Europe/Amsterdam` (CET/CEST);
- stabiele UIDs zodat agenda-apps events niet dupliceren;
- geen database, accounts of tracking.

## 2. Is GitHub Pages voldoende?

**Nee.** GitHub Pages serveert uitsluitend statische bestanden. Het kan geen server-side berekening doen op queryparameters zoals `/calendar.ics?lat=52.728&lon=6.476`.

Daarom is een dynamische runtime nodig.

## 3. Gekozen architectuur

**Node.js + Hono op Render** (geen Cloudflare nodig)

```
Browser / agenda-app
        ↓
  Node-server (Hono)
        ├── GET /                 → instructiepagina + generator
        └── GET /calendar.ics     → dynamische ICS-feed
                ↓
         suncalc + luxon
                ↓
         VCALENDAR response
```

Waarom deze keuze:

| Optie | Geschikt? | Reden |
|-------|-----------|-------|
| GitHub Pages | Nee | Geen dynamische server-side responses |
| **Render (Node)** | **Ja** | Eenvoudig, past bij bestaande repo, geen Cloudflare-account |
| Vercel / Netlify Functions | Ja | Ook geschikt als alternatief |
| Cloudflare Workers | Ja | Optioneel, niet nodig voor deze setup |
| Eigen VPS + database | Nee | Overbodig |

Geen database: de feed wordt volledig uit `latitude`, `longitude` en de huidige datum gegenereerd.

## 4. Directorystructuur

```
nachtcalendar/
├── README.md
├── LICENSE
├── package.json
├── render.yaml
├── tsconfig.json
├── vitest.config.ts
├── docs/
│   └── ARCHITECTURE.md
├── public/
│   └── index.html
├── src/
│   ├── node-server.ts    # Node HTTP-entrypoint
│   ├── app.ts            # HTTP-routes (Hono)
│   ├── constants.ts
│   ├── validate.ts
│   ├── window.ts
│   ├── astronomy.ts
│   ├── ics.ts
│   └── locations.ts
└── tests/
```

## 5. Libraries

| Library | Rol |
|---------|-----|
| **Hono** | HTTP-router |
| **suncalc** | Astronomie (civil dawn/dusk −6°) |
| **luxon** | IANA `Europe/Amsterdam`, kalendermaanden/-jaren, DST |
| **tsx** | TypeScript runtime voor Node |
| **vitest** | Tests |

ICS wordt handmatig opgebouwd met UTC-tijden (`...Z`) voor maximale compatibiliteit.

## 6. Agenda-abonnement

```
https://<render-service>.onrender.com/calendar.ics?lat=52.7286&lon=6.4763
```

of zonder parameters (Hoogeveen):

```
https://<render-service>.onrender.com/calendar.ics
```
