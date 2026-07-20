# Implementatieplan – Fase 1

## Volgorde (uitgevoerd)

| # | Stap | Status |
|---|------|--------|
| 1 | Architectuurdocument | ✅ |
| 2 | Bronregister | ✅ |
| 3 | Datamodel (Prisma) | ✅ |
| 4 | NL bronadapters | ✅ |
| 5 | EU bronadapters | ✅ |
| 6 | Normalisatie | ✅ |
| 7 | Juridische zoekfunctie | ✅ |
| 8 | Citatievalidatie | ✅ |
| 9 | Casusstructurering | ✅ |
| 10 | Issue tree | ✅ |
| 11 | Jurisprudentieanalyse | ✅ |
| 12 | Claimgenerator | ✅ |
| 13 | Proceskansmodel | ✅ |
| 14 | Interface | ✅ |
| 15 | Tests | ✅ |
| 16 | Documentatie | ✅ |
| 17 | Testcasussen | ✅ |

## Testcasussen (geen vooraf bepaalde uitkomst)

1. Herhaald provocerend gedrag in burenconflict
2. Mogelijke intimidatie
3. Overtreding civiel contact-/terreinverbod
4. Mogelijke onrechtmatige daad
5. Mogelijke belaging
6. Mogelijke bedreiging
7. Gemeentelijk verzoek om handhaving bij woonoverlast

## Technische keuzes

- **Next.js 15 App Router**: bestaande repo, server-side API routes voor bronopvraging
- **Prisma + PostgreSQL**: relationeel datamodel voor dossiers
- **BullMQ + Redis**: achtergrondwachtrij (optioneel, graceful fallback)
- **Rule-based LLM mock**: geen externe API vereist voor demo
- **Vitest**: unit tests; Playwright config aanwezig voor E2E
- **fast-xml-parser**: veilige XML parsing (geen XXE)

## Volgende fases (niet in scope fase 1)

- Volledige EUR-Lex SOAP integratie met registratie
- Gebruikersauthenticatie (OIDC)
- Volledige documentupload OCR
- Real-time collaboratie
- Volledige Verdragenbank API
- Machine learning proceskansmodel op basis van historische data
