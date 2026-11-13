# Backup & herstel — Walda Zakelijk

## Lokaal (Docker)

```bash
docker compose exec db mysqldump -u walda -pwalda_dev_only walda > backup-local.sql
```

## Productie (na toegang)

1. Provider-backup controleren (dagelijks)
2. Voor deploy: `mysqldump` + `tar` van `public_html` via SSH
3. Herstel: bestanden terugzetten + DB import + `wp search-replace` indien URL wijzigt
