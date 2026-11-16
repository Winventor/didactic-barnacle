# Backup & herstel — PLP112

## Lokaal (Docker)

```bash
docker compose exec db mysqldump -u plp112 -pplp112_dev_only plp112 > backup-local.sql
```

## Productie (na toegang)

1. Provider-backup controleren (dagelijks)
2. Voor deploy: `mysqldump` + `tar` van `public_html` via SSH
3. Herstel: bestanden terugzetten + DB import + `wp search-replace` indien URL wijzigt
