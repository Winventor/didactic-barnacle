# 3. Hostingproviders en technische verbindingen

## mijn.host

| Onderdeel | Details |
|-----------|---------|
| Control panel | https://mijn.host/cp/ |
| API base | `https://my.host/api/v2` |
| API auth | `Authorization: Bearer mh_pat_…` (scopes) |
| API scope | Domeinen, DNS, VPS, certificaten, account — **niet** shared hosting/WordPress |
| Hosting panel | DirectAdmin |
| SSH | Poort **26**, standaard uit; inschakelen in control panel |
| SFTP/FTPS | Inbegrepen |
| WordPress | 1-klik install, staging, caching (LiteSpeed/Redis), dagelijkse backups |
| WP-pakketten (indicatief) | WP Start ~€1,99 intro / €3,99; WP Basic ~€4,99 / €9,99; WP Expert hoger — altijd actuele site checken |

**Verbinding Cursor → mijn.host**

1. PAT aanmaken: Account → API access.
2. Token in Cursor Secret `MIJNHOST_API_TOKEN`.
3. CLI: `./webdiensten/scripts/mijnhost.sh …`
4. Hosting: SSH-key of DA-wachtwoord als secrets; WP Application Password voor REST.

## SiteGround

| Onderdeel | Details |
|-----------|---------|
| Publieke API | **Geen** |
| SSH | Poort **18765**, alleen SSH-keys |
| Webroot | `/home/customer/www/<domein>/public_html/` |
| WP-CLI | Voorgeïnstalleerd |
| Staging | GrowBig en hoger |
| Git in Site Tools | GoGeek |
| Datacenters EU | o.a. Nederland, Duitsland, Spanje, VK |

**Adviespakket:** zie `projects/siteground-websites/docs/PAKKETADVIES.md` → **GrowBig** (meerdere sites + staging + SSH); **GoGeek** als native Git vereist.

## Cursor-zijde

| Integratie | Status |
|------------|--------|
| GitHub | Actief |
| mijn.host API | Voorbereid; wacht op token |
| WordPress MCP | Beschikbaar na MCP-auth |
| Browserless | Optioneel voor visuele checks |
