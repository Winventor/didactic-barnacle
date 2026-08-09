# Schemer en Nacht

Dynamisch iCalendar-agenda-abonnement (`.ics`) met **avondschemer**, **nacht** en **ochtendschemer** voor een willekeurige geografische locatie.

## Wat doet dit project?

Je abonneert je agenda-app op een URL met latitude/longitude. Bij ieder verzoek genereert de server opnieuw een kalender van:

- **start:** vandaag − 1 kalendermaand  
- **einde:** vandaag + 1 kalenderjaar  

Daardoor schuift het abonnement vanzelf mee. Geen accounts, geen database, geen cookies.

Standaardlocatie (zonder parameters): **Hoogeveen** (`52.7286`, `6.4763`).

## Hoe werkt Schemer en Nacht?

Per logische nacht (vanaf zonsondergang op dag X):

| Fase | Start | Einde |
|------|-------|-------|
| **Schemer** (avond) | zonsondergang | einde burgerlijke avondschemering |
| **Nacht** | einde burgerlijke avondschemering | begin burgerlijke ochtendschemering (dag X+1) |
| **Schemer** (ochtend) | begin burgerlijke ochtendschemering | zonsopkomst (dag X+1) |

De drie perioden sluiten exact op elkaar aan.

## Welke astronomische definities worden gebruikt?

- **Zonsondergang / zonsopkomst:** officiële zonsondergang en -opkomst  
- **Burgerlijke schemering:** het middelpunt van de zon staat **6° onder de horizon**  
  - einde avondschemer = `civil dusk`  
  - begin ochtendschemer = `civil dawn`  

Berekeningen zijn locatie-afhankelijk via [SunCalc](https://github.com/mourner/suncalc). Tijden worden verwerkt in de IANA-tijdzone **`Europe/Amsterdam`** (CET/CEST via [Luxon](https://moment.github.io/luxon/)) — nooit als vaste UTC+1/UTC+2.

## Architectuurkeuze (waarom geen GitHub Pages?)

GitHub Pages kan **geen** dynamische server-side `.ics`-feeds genereren op basis van queryparameters. Agenda-apps moeten een HTTP-URL ophalen die `text/calendar` teruggeeft.

Deze app draait daarom als **Node.js-service op Render** — **zonder Cloudflare**. Zie [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

```
Browser / agenda-app
        ↓
  Node-server (Hono)
        ├── GET /              → instructiepagina + generator
        └── GET /calendar.ics  → dynamische ICS-feed
```

## Hoe start ik het lokaal?

```bash
cd nachtcalendar
npm install
npm run dev
```

Open:

- Instructiepagina: http://localhost:8787/  
- ICS (Hoogeveen): http://localhost:8787/calendar.ics  
- ICS (Amsterdam): http://localhost:8787/calendar.ics?lat=52.3676&lon=4.9041  

Productie-start (zelfde entrypoint):

```bash
npm start
```

## Hoe voer ik tests uit?

```bash
cd nachtcalendar
npm test
```

Tests dekken o.a. winter/zomer, DST-overgangen, Nederlandse locaties, eventvolgorde, ICS-output, stabiele UIDs, URL-validatie en het voortschrijdende venster.

## Hoe deploy ik het? (Render — geen Cloudflare)

### Optie A — Render Blueprint (aanbevolen)

1. Ga naar [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
2. Koppel deze GitHub-repository.
3. Gebruik `render.yaml` in de repo-root (bevat service `nachtcalendar`)  
   of `nachtcalendar/render.yaml` voor alleen deze app.
4. Deploy. Render geeft een URL zoals:

```text
https://nachtcalendar.onrender.com
```

Abonnements-URL:

```text
https://nachtcalendar.onrender.com/calendar.ics
https://nachtcalendar.onrender.com/calendar.ics?lat=52.7286&lon=6.4763
```

### Optie B — Handmatige Web Service

1. **New → Web Service**
2. Root directory: `nachtcalendar`
3. Build: `npm ci`
4. Start: `npm start`
5. Health check path: `/health`

### GitHub Actions

Workflow: [`.github/workflows/nachtcalendar.yml`](../.github/workflows/nachtcalendar.yml)

Bij push/PR op `nachtcalendar/**`:

1. `npm ci`
2. `npm test`
3. `npm run build` (typecheck)

Deploy naar Render gebeurt via Render’s GitHub-koppeling (Blueprint/autodeploy), niet via Cloudflare.

> **Let op (gratis plan):** Render kan free services slapen na inactiviteit. De eerste request na slaap duurt langer; daarna werkt het abonnement normaal.

## Hoe maak ik een abonnement?

1. Open de instructiepagina (`/`).  
2. Kies een plaats of vul latitude/longitude in.  
3. Klik **Maak agenda-abonnement**.  
4. Kopieer de URL en voeg die toe als **abonnement** in je agenda-app.

Voorbeeld na deploy:

```text
https://nachtcalendar.onrender.com/calendar.ics?lat=52.7286&lon=6.4763
```

Zonder parameters (Hoogeveen):

```text
https://nachtcalendar.onrender.com/calendar.ics
```

## Hoe voeg ik het toe aan Apple Calendar?

1. Mac: **Archief → Nieuw agenda-abonnement…**  
   iOS: **Agenda’s → Voeg agenda-abonnement toe**  
2. Plak de URL.  
3. Bevestig. Laat het als abonnement staan.

## Hoe voeg ik het toe aan Google Calendar?

1. Open Google Calendar (desktop).  
2. Links: **Andere agenda's → Via URL**.  
3. Plak de URL → **Agenda toevoegen**.  
4. Gebruik **niet** “Importeren” als je updates wilt.

## Hoe voeg ik het toe aan Outlook?

1. Voeg een **internetagenda** / agenda vanaf internet toe.  
2. Plak de abonnements-URL.  
3. Importeer het `.ics`-bestand niet als vaste lijst afspraken.

## Hoe voeg ik het toe aan Nextcloud?

1. Open Nextcloud Calendar.  
2. Voeg een **nieuwe agenda / abonnement / externe kalender** toe.  
3. Plak de URL zodat de feed periodiek wordt ververst.

### Importeren ≠ abonneren

| | Importeren | Abonneren |
|---|------------|-----------|
| Resultaat | Eenmalige kopie | Periodiek opnieuw ophalen |
| Updates | Geen | Ja, voortschrijdend venster |

## Hoe ziet de API/URL eruit?

### Queryparameters (aanbevolen)

```http
GET /calendar.ics
GET /calendar.ics?lat=52.7286&lon=6.4763
```

| Parameter | Verplicht | Bereik | Opmerking |
|-----------|-----------|--------|-----------|
| `lat` | nee* | −90 … +90 | Decimaalpunt |
| `lon` | nee* | −180 … +180 | Alias: `lng` |

\* Beide weglaten → Hoogeveen. Eén van beide weglaten → HTTP 400.

### Padvariant

```http
GET /calendar/52.7286/6.4763.ics
```

### Response

- `Content-Type: text/calendar; charset=utf-8`  
- `Cache-Control: public, max-age=21600` (6 uur)  
- Geldige `VCALENDAR` / `VEVENT` met stabiele UIDs

### Kalendernaam

- Bekende locatie: `X-WR-CALNAME:Schemer en Nacht - Hoogeveen`  
- Alleen coördinaten: `X-WR-CALNAME:Schemer en Nacht`

## Welke privacyaspecten zijn er?

- Latitude/longitude worden alleen gebruikt om astronomische tijden te berekenen.  
- Er is **geen** permanente opslag, database of gebruikersaccount.  
- Geen analytics of tracking.  
- De volledige configuratie zit in de deelbare URL.

## Tech-stack

- TypeScript + Hono op Node.js  
- SunCalc (astronomie)  
- Luxon (`Europe/Amsterdam`)  
- Render (hosting)  
- Vitest  

## Directorystructuur

```text
nachtcalendar/
├── public/index.html     # instructiepagina + generator
├── src/                  # calendar endpoint + berekeningen
├── tests/
├── docs/ARCHITECTURE.md
├── render.yaml
└── package.json
```
