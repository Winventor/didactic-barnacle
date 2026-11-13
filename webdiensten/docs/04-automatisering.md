# 4. Beschikbare automatiseringsmogelijkheden

## Werkt nu (zonder provider-credentials)

- Documentatie, procedures, agentrollen
- Publieke DNS/RDAP-controles (`dig`, SIDN RDAP)
- Lokale WordPress-stack (Docker Compose) voor Walda
- SiteGround/Walda templates en checklists
- Change-log en goedkeuringsgates in procedures

## Werkt met `MIJNHOST_API_TOKEN`

| Opdracht (NL) | Commando / flow |
|---------------|-----------------|
| Controleer of deze domeinnaam beschikbaar is | `mijnhost.sh domains availability <domein>` |
| Laat zien welke domeinen ik heb | `mijnhost.sh domains list` |
| Controleer DNS van dit domein | `mijnhost.sh dns get <domein>` (+ optioneel dig) |
| Toon prijzen voor extensie | `mijnhost.sh extensions get nl` |
| Bereid DNS voor hosting voor | `dns propose-hosting` → dry-run JSON; toepassen pas na goedkeuring |
| Backup DNS vóór wijziging | Automatisch naar `logs/dns-backups/` |

Mutaties (`dns update`, `domains order`) vereisen scopes én **expliciete goedkeuring**; CLI weigert zonder `--i-approve`.

## Werkt met SSH/SFTP

- Bestanden syncen, WP-CLI updates, staging sync
- SiteGround: key-based SSH scripts in `siteground-websites/procedures/`

## WordPress REST / WP-CLI

- Content en settings via Application Password
- Onderhoud via WP-CLI over SSH
- WordPress MCP in Cursor na authenticatie

## Niet automatisch vanuit Cloud Agent

- SiteGround checkout / betaling
- mijn.host hostingpakket bestellen (geen hosting-API)
- Captcha/interactive browser login zonder Browserless + credentials
