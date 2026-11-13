# Live inventarisatie mijn.host (13 nov 2026, Europe/Amsterdam)

Credentials in Cursor Secrets geverifieerd. Geen geheimen in dit document.

## Verbindingen

| Kanaal | Status | Details |
|--------|--------|---------|
| DirectAdmin API | OK | `https://h70.mijn.host:2222`, user `bm142842` |
| SFTP | OK | Host `h70.mijn.host` poort **22** (niet 26) |
| SSH-shell | Uit | `ssh=OFF`; poort 26 weigert |
| Officiële mijn.host API (domeinregistrar) | Ontbreekt | Geen `MIJNHOST_API_TOKEN` |

Let op: secret `MIJNHOST_SFTP_HOST` bevat nu de DA-URL; agents gebruiken automatisch `h70.mijn.host`.

## Hostingpakket

| Veld | Waarde |
|------|--------|
| Pakket | `mijnhost_basic` (custom) |
| Max domeinen | 5 (1 in gebruik) |
| Schijf | ~2,8 GB van 10 GB in gebruik |
| MySQL | 5/5 databases in gebruik |
| WordPress-installatie-optie | ON (nog geen WP live) |
| Git | ON |
| DNS-beheer in DA | ON |
| E-mail account | ggj.walda@gmail.com |

## Domeinen & sites op dit account

| Host | Rol | Techniek |
|------|-----|----------|
| `sldrenthe.nl` | Landing | Statische HTML |
| `leden.sldrenthe.nl` | Ledenadministratie | CiviCRM (HTTP 403 publiek) |
| `documenten.sldrenthe.nl` | Documenten | Nextcloud |
| `staging.sldrenthe.nl` | Staging | Apart domeinobject in DA |
| `staging2.sldrenthe.nl` | Staging 2 | Nextcloud-achtig (HTTP 200) |

IP: `62.129.138.7` · NS: `ns1/ns2/ns3.mijn.host`

### Databases

- `bm142842_sldrentheadministratie`
- `bm142842_nextcloudsldrenthe`
- `bm142842_sldnc2`
- `bm142842_sldstg`
- `bm142842_sldstgr`

**MySQL-limiet is vol (5/5).** Voor Walda Zakelijk WordPress is óf een DB vrijmaken, óf pakketupgrade, óf apart hostingpakket nodig.

### DNS `sldrenthe.nl` (samenvatting)

- A/apex + www/subdomeinen → `62.129.138.7`
- MX → mx1/mx2.mijn.host
- SPF: `v=spf1 include:spf.mijn.host ~all`
- DKIM: aanwezig (`x._domainkey`)
- DMARC: `p=quarantine`

DNS lezen/back-uppen via DA werkt; wijzigingen op productie alleen na goedkeuring.

## Gevolgen voor Walda Zakelijk

1. Bestaand account is in gebruik voor **SLD Drenthe** (niet leeg).
2. Er is nog ruimte voor **extra domeinen** (max 5), maar **geen vrije MySQL-database**.
3. Aanbevolen: apart WordPress-hostingpakket voor Walda, of upgrade/opschonen DB’s — **goedkeuring vereist**.
4. Voor domeinregistratie (`waldazakelijk.nl` e.d.) nog steeds `MIJNHOST_API_TOKEN` of handmatig in het control panel.

## CLI

```bash
./webdiensten/scripts/mijnhost-da.sh login-test
./webdiensten/scripts/mijnhost-da.sh account
./webdiensten/scripts/mijnhost-da.sh domains list
./webdiensten/scripts/mijnhost-da.sh domains dns sldrenthe.nl
./webdiensten/scripts/mijnhost-da.sh domains dns-backup sldrenthe.nl
./webdiensten/scripts/mijnhost-da.sh sftp-info
```
