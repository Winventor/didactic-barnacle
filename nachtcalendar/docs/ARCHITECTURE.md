# Architectuur — Schemer en Nacht

## GitHub Pages?

**Nee.** GitHub Pages is alleen static en kan geen dynamische `.ics`-feed genereren op basis van `lat`/`lon`.

## Gekozen hosting

**Cloudflare Workers** (primair) + lokale Node-server voor ontwikkeling.

```
Browser / agenda-app
        ↓
  Cloudflare Worker (Hono)
        ├── GET /              → public/index.html
        └── GET /calendar.ics  → dynamische VCALENDAR
                ↓
         suncalc + luxon
```

Render blijft optioneel (`render.yaml`).

## Libraries

| Library | Rol |
|---------|-----|
| Hono | HTTP-router (Workers + Node) |
| suncalc | sunset / civil dusk / dawn / sunrise |
| luxon | Europe/Amsterdam, kalendermaanden/-jaren, DST |
| wrangler | Cloudflare deploy |
| vitest | Tests |

## Deploy

GitHub Actions workflow `nachtcalendar.yml`:

1. test + typecheck  
2. `wrangler deploy` als secrets aanwezig zijn:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
