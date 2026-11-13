# SiteGround-pakketadvies (actueel nov 2026, EU)

Bronnen: [eu.siteground.com web hosting](https://eu.siteground.com/web-hosting.htm), [KB current rates](https://www.siteground.com/kb/current-rates-shared-hosting-plans), SiteGround llm-info.

Prijzen excl. btw; introductieprijs geldt alleen eerste termijn — reken met **verlengingsprijs**.

| | StartUp | GrowBig | GoGeek |
|--|---------|---------|--------|
| Websites | 1 | Onbeperkt | Onbeperkt |
| Opslag | 10 GB | 50 GB | 100 GB |
| Staging | Nee | Ja | Ja |
| SSH / WP-CLI | Beperkt / ja* | Ja | Ja |
| Git in Site Tools | Nee | Nee | Ja |
| On-demand backups | Nee | Ja | Ja |
| Intro ~12 mnd | ~€1,99/m | ~€3,99/m | ~€5,99/m |
| Verlenging 12 mnd | ~€15,99/m | ~€27,99/m | ~€39,99/m |

\*Controleer actuele StartUp-features; voor multi-site + agents is StartUp ongeschikt.

## Advies

**GrowBig** — beste start voor meerdere websites met staging, SSH, WP-CLI en on-demand backups. Automatisering vanuit Cursor via SSH + WP-CLI + GitHub Actions.

Kies **GoGeek** als je native Site Tools Git, private DNS of white-label nodig hebt.

**Niet bestellen** zonder jouw expliciete goedkeuring.

## Cursor-koppeling

SiteGround heeft **geen publieke API**. Werkwijze:

1. SSH-key in Site Tools → Devs → SSH Keys Manager  
2. Secrets: `SITEGROUND_SSH_HOST`, `SITEGROUND_SSH_USER`, `SITEGROUND_SSH_KEY` (poort 18765)  
3. Per site: webroot `/home/customer/www/<domein>/public_html/`  
4. Deploy: rsync/scp of GitHub Action over SSH; tests vóór push  
5. Staging: Site Tools staging; Easy/Advanced Push alleen na goedkeuring  
