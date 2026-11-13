# Mijn.host – Domeinbeheer

Werkomgeving: **`mijnhost-domeinbeheer`**

Centrale beheeromgeving voor domeinonderzoek, registratievoorbereiding en DNS via de officiële mijn.host API.

## Vereisten

1. Account op [mijn.host](https://mijn.host/) — **aanwezig** (hosting `h70` / `sldrenthe.nl`)
2. DirectAdmin-secrets: `MIJNHOST_DA_URL`, `MIJNHOST_DA_USER`, `MIJNHOST_DA_PASS` — **aanwezig**
3. SFTP-secrets — **aanwezig** (host effectief `h70.mijn.host:22`)
4. Personal Access Token voor registrar-API: Control Panel → Account → API access  
   Cursor Secret: `MIJNHOST_API_TOKEN` — **nog toe te voegen** (beschikbaarheid/registratie)

## DirectAdmin CLI (werkt nu)

```bash
./webdiensten/scripts/mijnhost-da.sh account
./webdiensten/scripts/mijnhost-da.sh domains list
./webdiensten/scripts/mijnhost-da.sh domains dns sldrenthe.nl
```

## CLI

```bash
# vanaf repo-root
export MIJNHOST_API_TOKEN=mh_pat_…   # of via Cursor Secret

./webdiensten/scripts/mijnhost.sh whoami
./webdiensten/scripts/mijnhost.sh domains list
./webdiensten/scripts/mijnhost.sh domains availability waldazakelijk.nl
./webdiensten/scripts/mijnhost.sh domains get voorbeeld.nl
./webdiensten/scripts/mijnhost.sh extensions get nl
./webdiensten/scripts/mijnhost.sh dns get voorbeeld.nl
./webdiensten/scripts/mijnhost.sh dns backup voorbeeld.nl
./webdiensten/scripts/mijnhost.sh dns propose-hosting voorbeeld.nl 203.0.113.10
./webdiensten/scripts/mijnhost.sh dns mail-check voorbeeld.nl
./webdiensten/scripts/mijnhost.sh dns apply-file path/to/records.json --dry-run
# na goedkeuring:
./webdiensten/scripts/mijnhost.sh dns apply-file path/to/records.json --i-approve
```

Mutaties zonder `--i-approve` worden geweigerd. `domains order` is bewust extra beveiligd.

## Mappen

| Pad | Inhoud |
|-----|--------|
| `src/` | Clientbibliotheek |
| `config/` | Niet-geheime defaults |
| `logs/` | Change-log + DNS-backups (geen secrets) |
| `procedures/` | Runbooks |
| `fixtures/` | Voorbeeld-DNS-voorstellen |

## API-referentie

https://mijn.host/api/doc/ — base URL `https://my.host/api/v2`
