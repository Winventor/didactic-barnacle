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

Deze app draait daarom als **Cloudflare Worker** (stateless, gratis/goedkoop, deploybaar vanuit GitHub). Zie [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

```
Browser / agenda-app
        ↓
  Cloudflare Worker
        ├── GET /              → instructiepagina + generator
        └── GET /calendar.ics  → dynamische ICS-feed
```

## Hoe start ik het lokaal?

```bash
cd nachtcalendar
npm install
npm run dev:node
```

Open:

- Instructiepagina: http://localhost:8787/  
- ICS (Hoogeveen): http://localhost:8787/calendar.ics  
- ICS (Amsterdam): http://localhost:8787/calendar.ics?lat=52.3676&lon=4.9041  

Of met Wrangler (Cloudflare-lokaal):

```bash
npm run dev
```

## Hoe voer ik tests uit?

```bash
cd nachtcalendar
npm test
```

Tests dekken o.a. winter/zomer, DST-overgangen, Nederlandse locaties, eventvolgorde, ICS-output, stabiele UIDs, URL-validatie en het voortschrijdende venster.

## Hoe deploy ik het?

### Eenmalig in Cloudflare

1. Maak een Cloudflare-account.  
2. Maak een API-token met rechten om Workers te deployen.  
3. Noteer je Account ID.

### Eenmalig in GitHub

Repository secrets:

| Secret | Beschrijving |
|--------|--------------|
| `CLOUDFLARE_API_TOKEN` | API-token |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID |

### Automatisch via GitHub Actions

Workflow: [`.github/workflows/nachtcalendar.yml`](../.github/workflows/nachtcalendar.yml)

Bij push naar `master`/`main` (pad `nachtcalendar/**`):

1. `npm ci`  
2. `npm test`  
3. `npm run build` (typecheck)  
4. `wrangler deploy` (alleen als de Cloudflare-secrets gezet zijn)

Handmatig deployen:

```bash
cd nachtcalendar
npm run deploy
```

## Hoe maak ik een abonnement?

1. Open de instructiepagina (`/`).  
2. Kies een plaats of vul latitude/longitude in.  
3. Klik **Maak agenda-abonnement**.  
4. Kopieer de URL en voeg die toe als **abonnement** in je agenda-app.

Voorbeeld:

```text
https://<jouw-worker>.workers.dev/calendar.ics?lat=52.7286&lon=6.4763
```

Zonder parameters (Hoogeveen):

```text
https://<jouw-worker>.workers.dev/calendar.ics
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
- `Cache-Control: public, max-age=21600` (6 uur; minstens dagelijks opnieuw actueel)  
- Geldige `VCALENDAR` / `VEVENT` met stabiele UIDs

### Kalendernaam

- Bekende locatie: `X-WR-CALNAME:Schemer en Nacht - Hoogeveen`  
- Alleen coördinaten: `X-WR-CALNAME:Schemer en Nacht`

### Stabiele UIDs (voorbeeld)

```text
schemer-evening-2024-06-15-52.72860-6.47630@nachtcalendar
nacht-2024-06-15-52.72860-6.47630@nachtcalendar
schemer-morning-2024-06-15-52.72860-6.47630@nachtcalendar
```

## Welke privacyaspecten zijn er?

- Latitude/longitude worden alleen gebruikt om astronomische tijden te berekenen.  
- Er is **geen** permanente opslag, database of gebruikersaccount.  
- Geen analytics of tracking.  
- De volledige configuratie zit in de deelbare URL.

## Tech-stack

- TypeScript + Hono  
- SunCalc (astronomie)  
- Luxon (`Europe/Amsterdam`)  
- Cloudflare Workers + Wrangler  
- Vitest  

## Directorystructuur

```text
nachtcalendar/
├── public/index.html     # instructiepagina + generator
├── src/                  # calendar endpoint + berekeningen
├── tests/
├── docs/ARCHITECTURE.md
├── wrangler.toml
└── package.json
```
