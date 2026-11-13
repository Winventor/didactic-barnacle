# Technische architectuur

## Doelbeeld

```
Nederlandse opdracht (Cursor)
        │
        ▼
┌───────────────────┐
│  Agentrollen      │  website / hosting / dns / wordpress / test
└─────────┬─────────┘
          │
          ├──────────────► GitHub (versiebeheer, CI, PR’s)
          │
          ├──────────────► mijn.host API (domein + DNS)
          │                 secrets: MIJNHOST_API_TOKEN
          │
          ├──────────────► mijn.host hosting (SSH:26 / SFTP / WP-CLI / WP REST)
          │                 secrets: host, user, key/password, WP app password
          │
          └──────────────► SiteGround (SSH:18765 / SFTP / WP-CLI / Git)
                            secrets: host, user, private key
```

## Omgevingslagen

| Laag | Doel | Waar |
|------|------|------|
| **Ontwikkeling** | Thema, contentmodellen, scripts | Cursor Cloud + Git; lokaal Docker WordPress |
| **Test / staging** | Functioneel & veiligheidscontrole | Docker lokaal of provider-staging (mijn.host / SiteGround) |
| **Productie** | Live site | Provider-hosting; wijzigingen alleen na goedkeuring |

## Projectscheiding

Alle drie de projecten leven in deze repository onder `webdiensten/projects/` zodat één Cloud Agent-omgeving alles kan bereiken. Later kunnen aparte GitHub-repos + Cursor-omgevingen worden afgesplitst zonder de mapstructuur te breken.

| Werkomgeving-ID | Inhoud |
|-----------------|--------|
| `waldazakelijk-website` | WP-thema, content, docker, publicatieprocedures |
| `mijnhost-domeinbeheer` | API-client, DNS-workflows, change-log |
| `siteground-websites` | Pakketadvies, WP-basis-template, per-site mappen |

## Geheimen

| Naam (voorstel) | Gebruik |
|-----------------|--------|
| `MIJNHOST_API_TOKEN` | Domein/DNS API (start met `domains:read`; later `write`/`purchase` na goedkeuring) |
| `MIJNHOST_SSH_*` | Hosting SSH/SFTP Walda |
| `WALDA_WP_APP_PASSWORD` | WordPress REST |
| `SITEGROUND_SSH_*` | SiteGround SSH-sleutel |

Opslag: Cursor Secrets / environment secrets. Nooit in Git, issues of markdown met echte waarden.

## Automatisering vs. handmatig

| Actie | Cursor Cloud Agent | Extra nodig |
|-------|--------------------|-------------|
| Code & docs | Ja | — |
| Domeincheck / DNS lezen | Ja | API-token |
| DNS schrijven productie | Ja (technisch) | Token + **goedkeuring** |
| Domein bestellen | Ja (technisch) | Token met `purchase` + **goedkeuring** |
| WordPress lokaal | Ja (met Docker) | Docker in omgeving |
| WordPress op hosting | Deels | SSH/SFTP credentials |
| SiteGround account aanmaken | Nee (betaald checkout) | Gebruiker in browser + goedkeuring |
| WP REST content | Ja | Application Password |
| Visuele tests | Deels | Browserless MCP of handmatig |

## Publicatieketen (WordPress)

1. Ontwikkel in Git (`theme/`, `content/`).
2. Test in Docker of provider-staging.
3. Agent: Tester/beveiliging checklist.
4. Goedkeuring gebruiker.
5. Deploy via SSH/rsync of Git-deploy; DB-migraties via WP-CLI.
6. Logboek bijwerken; DNS alleen indien nodig en goedgekeurd.
