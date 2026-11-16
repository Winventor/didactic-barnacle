# PLP112

Werkomgeving: **`plp112`**

Nieuw project onder de centrale webdienstenomgeving. Projectcode **PLP112** — doel, merknaam, domein en inhoud volgen in een aparte opdracht.

## Status

| Onderdeel | Status |
|-----------|--------|
| Technische basis | Ingericht |
| Lokale testomgeving (Docker) | Voorbereid |
| Domein | Nog te bepalen |
| Hostingpakket | Nog te bepalen (mijn.host of SiteGround) |
| WordPress op productie | Geblokkeerd (domein + hosting + goedkeuring) |
| Inhoud / huisstijl | Volgt aparte opdracht |

## Snelle start (lokaal)

```bash
cd webdiensten/projects/plp112
cp config/env.example .env   # pas indien nodig aan
docker compose up -d
# Site: http://localhost:8081
# Admin: http://localhost:8081/wp-admin  (zie .env)
```

Poort **8081** zodat dit naast Walda Zakelijk (8080) kan draaien.

## Documentatie in dit project

- [`docs/PROJECTBRIEF.md`](docs/PROJECTBRIEF.md) — open vragen (doel, merk, scope)
- [`docs/SITESTRUCTUUR.md`](docs/SITESTRUCTUUR.md) — voorstel pagina’s/IA
- [`docs/HOSTINGVOORBEREIDING.md`](docs/HOSTINGVOORBEREIDING.md)
- [`docs/DOMEINVOORSTEL.md`](docs/DOMEINVOORSTEL.md)
- [`procedures/`](procedures/) — publicatie, backup, onderhoud
- [`theme/plp112/`](theme/plp112/) — startthema (block theme)

## Agentvriendelijk onderhoud

- Contentmodellen en teksten in `content/` (markdown → later WP)
- Thema in Git; geen uploads/geheimen in repo
- Wijzigingen via PR → staging → goedkeuring → productie
