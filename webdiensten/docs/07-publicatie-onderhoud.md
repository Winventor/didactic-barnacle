# 7. Publicatie- en onderhoudsprocedures

## Publicatie (algemeen)

1. Wijzigingen in feature branch + PR.
2. Test in Docker/staging (functioneel, mobiel, performance, security checklist).
3. Agentrol *Tester en beveiligingscontroleur* afronden.
4. **Goedkeuring** voor productie.
5. Deploy (rsync/SSH/Git); smoke-test; logboek.

## Onderhoudscyclus

| Frequentie | Acties |
|------------|--------|
| Wekelijks | Plugin/core update-check op staging; security scan |
| Maandelijks | Performance (Lighthouse/TTFB), uptime, disk, backups verifiëren |
| Per incident | DNS/hosting diagnostics; restore-oefening indien nodig |

Details: agent `agents/wordpress-beheerder.md` en `agents/tester-beveiliging.md`.
