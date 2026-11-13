# Walda Zakelijk – Website

Werkomgeving: **`waldazakelijk-website`**

Professionele WordPress-website voor Walda Zakelijk bij **mijn.host**.

## Status

| Onderdeel | Status |
|-----------|--------|
| Technische basis | Ingericht |
| Lokale testomgeving (Docker) | Voorbereid |
| Domein | Kandidaten onderzocht; registratie wacht op goedkeuring |
| Hostingpakket | Voorstel klaar; bestelling wacht op goedkeuring |
| WordPress op productie | Geblokkeerd (toegang + goedkeuring) |
| Inhoud / huisstijl | Volgt aparte opdracht |

## Snelle start (lokaal)

```bash
cd webdiensten/projects/waldazakelijk-website
cp config/env.example .env   # pas indien nodig aan
docker compose up -d
# Site: http://localhost:8080
# Admin: http://localhost:8080/wp-admin  (zie .env)
```

## Documentatie in dit project

- [`docs/SITESTRUCTUUR.md`](docs/SITESTRUCTUUR.md) — voorstel pagina’s/IA
- [`docs/HOSTINGVOORBEREIDING.md`](docs/HOSTINGVOORBEREIDING.md)
- [`docs/DOMEINVOORSTEL.md`](docs/DOMEINVOORSTEL.md)
- [`procedures/`](procedures/) — publicatie, backup, onderhoud
- [`theme/walda-zakelijk/`](theme/walda-zakelijk/) — startthema (block theme)

## Agentvriendelijk onderhoud

- Contentmodellen en teksten in `content/` (markdown → later WP)
- Thema in Git; geen uploads/geheimen in repo
- Wijzigingen via PR → staging → goedkeuring → productie
