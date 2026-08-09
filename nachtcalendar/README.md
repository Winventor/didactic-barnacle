# Schemer en Nacht

Dynamisch iCalendar-agenda-abonnement (`.ics`) met **avondschemer**, **nacht** en **ochtendschemer** voor een willekeurige geografische locatie.

## Wat doet dit project?

Je abonneert je agenda-app op een URL met latitude/longitude. Bij ieder verzoek genereert de server opnieuw een kalender van:

- **start:** vandaag − 1 kalendermaand  
- **einde:** vandaag + 1 kalenderjaar  

Standaardlocatie (zonder parameters): **Hoogeveen** (`52.7286`, `6.4763`).

## Hoe werkt Schemer en Nacht?

| Fase | Start | Einde |
|------|-------|-------|
| **Schemer** (avond) | zonsondergang | einde burgerlijke avondschemering |
| **Nacht** | einde burgerlijke avondschemering | begin burgerlijke ochtendschemering (dag X+1) |
| **Schemer** (ochtend) | begin burgerlijke ochtendschemering | zonsopkomst (dag X+1) |

**Burgerlijke schemering:** het middelpunt van de zon staat **6° onder de horizon**.

Tijdzone: **`Europe/Amsterdam`** (CET/CEST via Luxon). Astronomie: SunCalc.

## Architectuur

GitHub Pages kan dit **niet** (alleen static bestanden).

Hosting: **Cloudflare Workers** (aanbevolen). Lokaal draait dezelfde app als Node-server.

```
Browser / agenda-app
        ↓
  Cloudflare Worker
        ├── GET /              → instructiepagina + generator
        └── GET /calendar.ics  → dynamische ICS-feed
```

Zie [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Lokaal starten

```bash
cd nachtcalendar
npm install
npm run dev
```

- Pagina: http://localhost:8787/  
- ICS: http://localhost:8787/calendar.ics  

Cloudflare lokaal simuleren: `npm run dev:cf`

## Tests

```bash
cd nachtcalendar
npm test
```

## Deploy op Cloudflare (eenvoudig)

Na éénmalige secrets deployt GitHub Actions automatisch bij merge/push naar `master`.

### Stap 1 — Cloudflare-account

1. Ga naar https://dash.cloudflare.com/ en log in (of maak een gratis account).
2. Klik links op **Workers & Pages** (een keer openen is genoeg).

### Stap 2 — Account ID kopiëren

1. Op de Workers-overzichtspagina zie je rechts **Account ID**.
2. Kopieer die waarde.

### Stap 3 — API-token maken

1. Ga naar https://dash.cloudflare.com/profile/api-tokens  
2. **Create Token**  
3. Kies template **Edit Cloudflare Workers** (of maak een token met rechten om Workers te bewerken).  
4. Maak aan en **kopieer de token** (die zie je maar één keer).

### Stap 4 — Secrets in GitHub zetten

1. Open https://github.com/Winventor/didactic-barnacle/settings/secrets/actions  
2. **New repository secret** → naam `CLOUDFLARE_API_TOKEN` → plak de token → Save  
3. Nog een secret → naam `CLOUDFLARE_ACCOUNT_ID` → plak het Account ID → Save  

### Stap 5 — Deploy

- Merge PR #20 naar `master`, **of**
- Op GitHub: **Actions → Nachtcalendar → Run workflow**

Na een geslaagde deploy staat je app op:

```text
https://nachtcalendar.<jouw-subdomain>.workers.dev/
```

Exacte URL staat in de GitHub Action-log bij de deploy-stap, en in het Cloudflare-dashboard onder **Workers & Pages → nachtcalendar**.

### Abonnements-URL’s

```text
https://nachtcalendar.<jouw-subdomain>.workers.dev/calendar.ics
https://nachtcalendar.<jouw-subdomain>.workers.dev/calendar.ics?lat=52.7286&lon=6.4763
```

Handmatig deployen (met Wrangler ingelogd):

```bash
cd nachtcalendar
npm run deploy
```

## Alternatief: Render

Render blijft beschikbaar via `render.yaml` / `nachtcalendar/render.yaml` als je Cloudflare even niet wilt gebruiken. Cloudflare is de primaire route.

## Agenda toevoegen

**Belangrijk:** abonneren ≠ importeren.  
Abonneren = periodiek opnieuw ophalen. Importeren = eenmalige kopie.

### Apple Calendar
Archief → Nieuw agenda-abonnement… (of op iPhone: Agenda’s → Voeg agenda-abonnement toe) → plak URL.

### Google Calendar
Andere agenda's → Via URL → plak URL.

### Outlook
Internetagenda / agenda vanaf internet toevoegen → plak URL.

### Nextcloud
Nieuwe agenda / abonnement / externe kalender → plak URL.

## API

```http
GET /calendar.ics
GET /calendar.ics?lat=52.7286&lon=6.4763
GET /calendar/52.7286/6.4763.ics
```

| Parameter | Verplicht | Bereik |
|-----------|-----------|--------|
| `lat` | nee* | −90 … +90 |
| `lon` | nee* | −180 … +180 |

\* Beide weg = Hoogeveen. Eén van beide weg = HTTP 400.

## Privacy

Geen accounts, geen cookies, geen tracking, geen database. Coördinaten worden alleen gebruikt om tijden te berekenen.
