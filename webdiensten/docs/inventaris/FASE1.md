# Fase 1 — Inventarisatie

Datum: 13 november 2026 (Europe/Amsterdam)

## Cursor Cloud Agent

| Onderdeel | Status |
|-----------|--------|
| Repository | `github.com/Winventor/didactic-barnacle` (admin/push) |
| Omgeving | Persoonlijke Cloud Agent-omgeving (1 repo) |
| Netwerkegress | Onbeperkt (allow-all) |
| Extra GitHub-repos | `obsidian-linebreak-cleaner` (niet in deze omgeving) |
| App-geheimen | Geen geconfigureerd |
| WordPress MCP | Aanwezig, vereist authenticatie (nog niet gekoppeld) |
| Browserless MCP | Vereist authenticatie |
| Google Docs/Drive MCP | Vereist authenticatie |
| Grafana Cloud | Afgewezen — niet nodig voor deze opdracht |

## Beschikbare tools op de VM

Aanwezig: `curl`, `jq`, `ssh`, `sftp`, `node`/`npm`, Git, GitHub CLI (read-only voor writes).

Niet standaard aanwezig: PHP, WP-CLI, Docker (afhankelijk van image/build). Lokale WordPress-stack via Docker Compose is voorbereid; runtime hangt af van Docker-beschikbaarheid in de omgeving.

## Wat agents rechtstreeks kunnen doen

- Code, thema’s, documentatie en procedures ontwikkelen in Git
- Nederlandse opdrachten vertalen naar concrete taken via agentrollen
- mijn.host API aanroepen zodra `MIJNHOST_API_TOKEN` beschikbaar is
- DNS publiek controleren (`dig`, RDAP) zonder credentials
- Lokale/test WordPress-omgeving voorbereiden en (met Docker) draaien
- SiteGround-workflows voorbereiden (SSH/SFTP/WP-CLI scripts) zonder live account

## Wat aanvullende toegang vereist

| Behoefte | Doel |
|----------|------|
| `MIJNHOST_API_TOKEN` (PAT) | Domeinen, DNS, prijzen, inventaris |
| mijn.host hostinglogin / SSH / SFTP | WordPress installeren & publiceren |
| WordPress Application Password of REST-credentials | WP REST-beheer op productie |
| SiteGround-account + SSH-sleutel | Multi-site hosting |
| Expliciete goedkeuring | Registraties, aankopen, productie-DNS, live publicatie |

## Providers — samenvatting onderzoek

### mijn.host

- **Officiële API** (`https://my.host/api/v2`): domeinen, beschikbaarheid, prijzen, registratie/transfer, DNS (A/AAAA/CNAME/MX/TXT/NS/CAA e.d.), zonefile, DNS-geschiedenis, contacten, nameservers, SSL-certificaten, VPS, account/tickets.
- **Authenticatie**: Personal Access Token (`Authorization: Bearer mh_pat_…`), scopes `read`/`write`/`purchase`/`critical`. API-keys deprecated.
- **Hosting**: DirectAdmin, SSH (poort 26, standaard uit), SFTP/FTPS, 1-klik WordPress, staging, dagelijkse backups. **Geen publieke hosting/WordPress-API** — beheer via SSH, SFTP, WP-CLI, REST API.
- **WHMCS-module**: bevestigt API-key/token uit control panel (`/cp/account/api/`).

### SiteGround

- **Geen publieke hosting-API.**
- Koppeling via SSH (poort 18765, key-only), SFTP, WP-CLI, Site Tools Git (GoGeek), staging (GrowBig+).
- Advies voor meerdere sites: **GrowBig** als start; **GoGeek** als Git in Site Tools vereist is.

## Domeinonderzoek (publiek, geen registratie)

| Domein | Indicatie |
|--------|-----------|
| `waldazakelijk.nl` | Waarschijnlijk vrij (SIDN RDAP 404, geen NS/A) |
| `walda-zakelijk.nl` | Waarschijnlijk vrij |
| `waldazakelijk.com` / `.eu` | Geen publieke DNS-records; bevestigen via mijn.host API |
| `walda.nl` | Bezet sinds 1999 (Openprovider NS) |

Definitieve beschikbaarheid en prijs pas via mijn.host API na token; registratie alleen na goedkeuring.
