# Deployment – Beleidsdashboard & Juridisch Onderzoeksplatform

## Live bekijken (opties)

### Optie 1: GitHub Pages (direct na push naar master)

**Standaard URL:** https://winventor.github.io/didactic-barnacle/

| App | Pad |
|-----|-----|
| Beleidsdashboard | `/` |
| Juridisch Onderzoeksplatform | `/juridisch/` |
| TES Labour Intelligence | `/tes/` |

Directe link juridisch: https://winventor.github.io/didactic-barnacle/juridisch/

De site wordt automatisch gebouwd en gepubliceerd via GitHub Actions (`Deploy naar GitHub Pages`).

**Static export:** het juridische platform draait client-side op GitHub Pages (geen server-API). Officiële bronnen openen via permanente links; live API-calls kunnen door CORS beperkt zijn.

### Optie 2: Render.com (eigen subdomein, aanbevolen voor productie)

1. Ga naar [render.com](https://render.com) en maak een account aan
2. Klik **New → Blueprint** en koppel deze GitHub-repository
3. Render leest `render.yaml` automatisch in
4. Je krijgt een URL zoals: `https://beleidsdashboard-openraadsinformatie.onrender.com`

### Optie 3: Eigen domein (bijv. `beleidsdashboard.nl`)

#### Via GitHub Pages

1. Ga naar **Repository → Settings → Pages → Custom domain**
2. Vul je domein in (bijv. `beleidsdashboard.nl` of `www.beleidsdashboard.nl`)
3. Voeg bij je DNS-provider een record toe:
   - **A-records** naar GitHub Pages IP's:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - **Of CNAME** voor subdomein: `www` → `winventor.github.io`
4. Stel een repository variable in: **Settings → Secrets and variables → Actions → Variables**
   - Naam: `CUSTOM_DOMAIN`
   - Waarde: `beleidsdashboard.nl` (jouw domein)
5. Push opnieuw naar `master` — de build draait dan **zonder** subpath (`/didactic-barnacle`)

#### Via Render.com

1. Deploy via Blueprint (zie optie 2)
2. Ga naar **Settings → Custom Domains** in Render
3. Voeg je domein toe en volg de DNS-instructies van Render

## Lokaal

```bash
npm install
npm run dev
```

Open http://localhost:3000 (dashboard) of http://localhost:3000/juridisch

## Build commando's

| Doel | Commando |
|------|----------|
| Lokaal ontwikkelen | `npm run dev` |
| Standaard build (met API) | `npm run build` |
| Static export / GitHub Pages | `STATIC_EXPORT=true GITHUB_PAGES=true npm run build:pages` |
| Static zonder subpath (eigen domein) | `STATIC_EXPORT=true npm run build:pages` |
