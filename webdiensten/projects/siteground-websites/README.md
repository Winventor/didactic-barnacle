# SiteGround – Websites

Werkomgeving: **`siteground-websites`**

Omgeving voor het ontwikkelen, publiceren en onderhouden van **meerdere** WordPress-websites bij SiteGround.

## Status

| Onderdeel | Status |
|-----------|--------|
| Pakketonderzoek & advies | Klaar → **GrowBig** (of GoGeek voor native Git) |
| Account | Nog niet aanwezig — bestelling wacht op goedkeuring |
| SSH/Git-workflow | Procedures voorbereid |
| Herbruikbare WP-basis | `templates/wordpress-basis/` |
| Per-site projecten | Map `sites/` (één submap per website) |

## Nieuwe website toevoegen

```bash
cp -R templates/wordpress-basis sites/voorbeeld-nl
# vul sites/voorbeeld-nl/README.md en config.example
```

Elke site krijgt eigen bestanden, Git-geschiedenis (map of later eigen repo), en secrets.
