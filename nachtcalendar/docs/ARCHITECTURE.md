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

Een puur client-side `.ics`-bestand zou:

- niet werken als agenda-abonnement (clients verwachten `text/calendar` via HTTP GET);
- geen voortschrijdend venster kunnen vernieuwen zonder opnieuw handmatig te downloaden.

Daarom is een dynamische runtime nodig.

## 3. Gekozen architectuur

**Cloudflare Workers + Hono (TypeScript)**

```
Browser / agenda-app
        ↓
  Cloudflare Worker (Hono)
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
| Cloudflare Workers | **Ja** | Stateless, goedkoop/gratis, edge-cache, GitHub Actions deploy |
| Vercel / Netlify Functions | Ja | Ook geschikt; Worker is eenvoudiger voor één endpoint |
| Eigen VPS + database | Nee | Overbodig |

Geen database: de feed wordt volledig uit `latitude`, `longitude` en de huidige datum gegenereerd.

## 4. Directorystructuur

```
nachtcalendar/
├── README.md
├── LICENSE
├── package.json
├── wrangler.toml
├── tsconfig.json
├── vitest.config.ts
├── docs/
│   └── ARCHITECTURE.md
├── public/
│   └── index.html
├── src/
│   ├── index.ts          # HTTP-routes (Hono)
│   ├── constants.ts      # standaardlocatie, tijdzone
│   ├── validate.ts       # lat/lon-validatie
│   ├── window.ts         # voortschrijdend datumvenster
│   ├── astronomy.ts      # sunset / civil dusk / dawn / sunrise
│   ├── ics.ts            # VCALENDAR-generatie
│   └── locations.ts      # bekende NL-locaties (UI/metadata)
└── tests/
    ├── astronomy.test.ts
    ├── ics.test.ts
    ├── validate.test.ts
    └── window.test.ts
```

## 5. Libraries

| Library | Rol | Waarom |
|---------|-----|--------|
| **Hono** | HTTP-router | Lichtgewicht, Workers + Node lokaal |
| **suncalc** | Astronomie | Onderhouden, locatie-afhankelijk, civil dawn/dusk (−6°) |
| **luxon** | Tijdzones / kalenderrekenen | IANA `Europe/Amsterdam`, kalendermaanden/-jaren, DST |
| **vitest** | Tests | Snel, TypeScript-vriendelijk |
| **wrangler** | Deploy/dev Worker | Officiële Cloudflare CLI |

ICS wordt handmatig opgebouwd (geen zware ICS-library nodig): `VCALENDAR` + `VEVENT` met UTC-tijden (`...Z`) voor maximale compatibiliteit met Apple Calendar, Google Calendar, Outlook en Nextcloud.

## 6. Agenda-abonnement

Clients abonneren zich op:

```
https://<host>/calendar.ics?lat=52.7286&lon=6.4763
```

of zonder parameters (standaard Hoogeveen):

```
https://<host>/calendar.ics
```

Response-headers:

- `Content-Type: text/calendar; charset=utf-8`
- `Cache-Control: public, max-age=21600` (6 uur; max. dagelijks actueel)
- geen cookies, geen auth

Bij opnieuw ophalen wordt het venster opnieuw berekend: vandaag − 1 maand t/m vandaag + 1 jaar.
