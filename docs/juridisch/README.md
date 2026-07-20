# Juridisch Onderzoeksplatform

Productiegeschikt webplatform voor juridisch onderzoek naar **Nederlands recht** en **Europees recht dat in Nederland van toepassing is**.

## Starten

```bash
# Dependencies
npm install

# Database (optioneel, voor dossieropslag)
cp .env.example .env
npm run docker:up
npm run db:generate
npm run db:push

# Development
npm run dev
```

Open [http://localhost:3000/juridisch](http://localhost:3000/juridisch)

## Functies (fase 1)

| Functie | Route | Beschrijving |
|---------|-------|--------------|
| Dashboard | `/juridisch` | Overzicht en navigatie |
| Definitie zoeken | `/juridisch/definities` | Juridische begrippen met bronnen |
| Casusanalyse | `/juridisch/casus` | Feitenextractie, issue tree, proceskans |
| Jurisprudentie | `/juridisch/jurisprudentie` | NL, EU, EHRM |
| Wetgeving | `/juridisch/wetgeving` | BWB, lokaal, EUR-Lex |
| Claim genereren | `/juridisch/claim` | Conceptdocumenten |
| Bronstatus | `/juridisch/bronnen` | Adapter health checks |

## Officiële bronnen (adapters)

| Adapter | Bron | Registratie |
|---------|------|-------------|
| `BwbSruAdapter` | wetten.overheid.nl (SRU) | Nee |
| `OfficialGazetteAdapter` | officielebekendmakingen.nl | Nee |
| `LocalRegulationsAdapter` | lokaleregelgeving.overheid.nl | Nee |
| `RechtspraakOpenDataAdapter` | data.rechtspraak.nl | Nee |
| `CouncilOfStateAdapter` | Raad van State (via ECLI:NL:RVS) | Nee |
| `TreatiesDatabaseAdapter` | verdragenbank.overheid.nl | Nee |
| `EurLexAdapter` | EUR-Lex (SPARQL/CELLAR) | Optioneel (SOAP) |
| `CellarAdapter` | publications.europa.eu | Nee |
| `CuriaAdapter` | curia.europa.eu | Nee |
| `HudocAdapter` | hudoc.echr.coe.int | Nee |

## API endpoints

```
GET  /api/juridisch/search?q=...&adapter=...
GET  /api/juridisch/definitions?term=...
POST /api/juridisch/analyze        { narrative, municipality?, format? }
POST /api/juridisch/claim          { narrative, documentType, tone, desiredOutcome, format? }
GET  /api/juridisch/sources/health
```

## Architectuur

Zie [docs/juridisch/ARCHITECTURE.md](../docs/juridisch/ARCHITECTURE.md)

## Bronregister

Zie [docs/juridisch/BRONREGISTER.md](../docs/juridisch/BRONREGISTER.md)

## Tests

```bash
npm test
```

## Export

Casusanalyse en claims exporteren naar **Markdown** en **DOCX** via de UI of API (`format: "markdown"` / `"docx"`).

## Drie bewijslabels

- **BRON** – rechtstreeks uit wetgeving, verdrag of uitspraak
- **AFGELEIDE RECHTSREGEL** – afgeleid uit meerdere bronnen
- **TOEPASSING OP DE CASUS** – analyse van gebruikersfeiten

## Bekende beperkingen

- Standaard rule-based LLM (geen externe API vereist)
- EUR-Lex SOAP vereist gratis registratie (`EUR_LEX_USERNAME` / `EUR_LEX_PASSWORD`)
- Niet alle SRU/API endpoints zijn 24/7 beschikbaar
- Volledige citatievalidatie vereist ophalen brontekst
- Gebruikersauthenticatie is basis (productie: OIDC aanbevolen)

## Privacy en disclaimer

- [Privacy en beveiliging](../docs/juridisch/PRIVACY.md)
- [Juridische disclaimer](../docs/juridisch/DISCLAIMER.md)

## Testcasussen

Zeven vooraf gedefinieerde casussen (zonder vooraf bepaalde uitkomst) zijn beschikbaar in de UI:

1. Burenconflict met provocatie
2. Intimidatie
3. Contactverbod overtreding
4. Onrechtmatige daad
5. Belaging
6. Bedreiging
7. Woonoverlast / handhaving

## Technische stack

- Next.js 15 + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- BullMQ + Redis (optioneel)
- Zod-validatie (types)
- Vitest (unit tests)
- fast-xml-parser (veilige XML parsing)
- docx (DOCX export)
