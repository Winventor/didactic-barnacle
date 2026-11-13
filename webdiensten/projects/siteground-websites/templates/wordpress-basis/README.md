# WordPress-basis (herbruikbaar)

Kopieer deze map naar `sites/<sitenaam>/` voor elke nieuwe website.

## Inhoud

- `theme/site-basis/` — minimale block theme
- `config.example` — niet-geheime defaults
- `PROCEDURE.md` — deploy/onderhoud hooks

## Na kopiëren

1. Hernoem thema en text domain
2. Vul `config.example` → lokale `.env` / Cursor Secrets (niet committen)
3. Koppel domein + DNS (via mijn.host-project indien daar geregistreerd)
