# 6. Back-up- en herstelprocedures

## DNS (mijn.host)

Voor elke wijziging:

```bash
./webdiensten/scripts/mijnhost.sh dns backup voorbeeld.nl
# schrijft JSON naar projects/mijnhost-domeinbeheer/logs/dns-backups/
```

Herstel: dry-run van backupbestand, daarna `--i-approve` na goedkeuring.

## WordPress (Walda / SiteGround)

| Bron | Frequentie | Herstel |
|------|------------|---------|
| Provider dagelijkse backup | Dagelijks | Via control panel / Site Tools |
| Pre-deploy snapshot | Voor elke productie-deploy | Files + DB dump via SSH |
| Git thema/config | Continu | `git revert` / checkout |

Procedures per project:

- `projects/waldazakelijk-website/procedures/backup-herstel.md`
- `projects/siteground-websites/procedures/backup-herstel.md`
