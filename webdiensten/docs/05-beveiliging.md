# 5. Beveiligings- en toegangsbeleid

## Principes

1. Geheimen alleen in Cursor Secrets / environment variables.
2. Minimale scopes op API-tokens (start: `domains:read`).
3. Productiewijzigingen alleen na goedkeuring en met voorafgaande backup.
4. Geen credentials in Git, chatlogs met plakwaarden, of screenshots van secrets.
5. SSH-keys met passphrase waar mogelijk; aparte keys per provider.

## Token-scopes mijn.host (aanbevolen opbouw)

| Fase | Scopes |
|------|--------|
| Inventarisatie | `domains:read`, `domains-profiles:read` |
| DNS-beheer | + `domains:write` |
| Registratie (na goedkeuring) | + `domains:purchase` (of order-scope) |
| Nooit standaard | `critical` tenzij strikt nodig |

## Omgevingen

| Omgeving | Toegang |
|----------|---------|
| Ontwikkeling | Lokaal Docker; geen productie-DB |
| Staging | Aparte URL / credentials; mag automatischer |
| Productie | Beperkte schrijfrechten; verplicht logboek |

## Verboden zonder goedkeuring

Domeinregistratie, transfers, opzeggingen, betaalde orders, productie-DNS, live deploy, definitief wissen, rechtenwijzigingen.
