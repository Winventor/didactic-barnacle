# Privacy en beveiliging – Juridisch Onderzoeksplatform

## Privacy by design

- Dossiergegevens worden standaard lokaal verwerkt (geen verplichte cloudopslag)
- PostgreSQL-database kan lokaal draaien via Docker Compose
- Volledige dossierinhoud wordt niet gelogd
- Auditlogs registreren alleen bronopvragingen en documentgeneratie (metadata)

## Versleuteling

- HTTPS verplicht in productie
- Database-verbinding via TLS configureerbaar
- Redis-verbinding lokaal of via TLS

## Externe AI-diensten

- Standaard: rule-based analyse (geen externe API)
- `ALLOW_EXTERNAL_LLM=false` by default
- Wanneer ingeschakeld: waarschuwing aan gebruiker, anonimisering waar mogelijk
- Dossiergegevens worden nooit gebruikt voor modeltraining

## Prompt injection

- Tekst uit uploads en opgehaalde bronnen wordt nooit als systeeminstructie behandeld
- Gebruikersdocumenten worden nooit als officiële bron gepresenteerd

## Bewaartermijn

- Configureerbaar via `DOSSIER_RETENTION_DAYS` (standaard 365 dagen)
- Veilige verwijdering en exporteerbaarheid ondersteund via API

## Rollen en rechten

- Basisimplementatie: enkelvoudige gebruiker
- Productie: OIDC/SSO aanbevolen

## AVG

Dit platform verwerkt mogelijk bijzondere persoonsgegevens in juridische dossiers.
De verwerkingsverantwoordelijke moet een DPIA uitvoeren en passende maatregelen treffen.
