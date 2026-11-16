# Hostingvoorbereiding — PLP112

Hostingkeuze volgt nadat doel en verkeer bekend zijn. Twee paden binnen deze omgeving:

| Optie | Wanneer | Projectkoppeling |
|-------|---------|------------------|
| **mijn.host** WordPress | Eén site, NL-hosting, naast bestaande accounts | DNS via `mijnhost-domeinbeheer` |
| **SiteGround** | Multi-site / groei / aparte isolatie | Template in `siteground-websites` |

## Checklist vóór bestelling (goedkeuring vereist)

- [ ] Doel en merknaam vastgelegd (`docs/PROJECTBRIEF.md`)
- [ ] Domein gekozen of tijdelijk op tijdelijk-URL
- [ ] Provider + pakket + looptijd akkoord
- [ ] Na levering: SSL, SSH/SFTP, WP-installatie
- [ ] Application Password voor agents
- [ ] Staging-omgeving aanmaken
- [ ] DNS naar hosting na goedkeuring

## Credentials (Cursor Secrets — namen)

| Secret | Doel |
|--------|------|
| `MIJNHOST_API_TOKEN` | Domein/DNS (indien mijn.host) |
| `PLP112_SSH_HOST` | Hostname/IP |
| `PLP112_SSH_USER` | SSH/SFTP-user |
| `PLP112_SSH_KEY` of wachtwoord-secret | SSH |
| `PLP112_WP_URL` | Productie-URL |
| `PLP112_WP_APP_PASSWORD` | REST API |
