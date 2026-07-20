# Juridisch Onderzoeksplatform – Architectuur

## Doel

Productiegeschikt platform voor juridisch onderzoek naar Nederlands recht en Europees recht dat in Nederland van toepassing is. Het systeem analyseert de juridische structuur van casussen en baseert conclusies op opgehaalde officiële bronnen (retrieval-first).

## Kernprincipes

1. **Retrieval-first**: geen juridische bewering zonder bronopvraging
2. **Drie labels**: BRON | AFGELEIDE RECHTSREGEL | TOEPASSING OP DE CASUS
3. **Bronhiërarchie**: primaire bronnen > officiële toelichting > secundair (nooit als enige basis)
4. **Transparantie**: elke bewering met controleerbare bronverwijzing en officiële URL
5. **Privacy by design**: dossiergegevens lokaal/versleuteld, geen training op gebruikersdata

## Systeemarchitectuur

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App (React)                       │
│  /juridisch  – Dashboard, Definities, Casus, Claim, Bronnen │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    API Routes (/api/juridisch)               │
│  search | analyze | claim | export | sources/health          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Service Layer                             │
│  DefinitionService | CaseAnalysisService | ClaimGenerator   │
│  SuccessAssessment | CitationValidator | ExportService      │
└──────────┬───────────────────────────────┬──────────────────┘
           │                               │
┌──────────▼──────────┐         ┌──────────▼──────────┐
│  LLM Provider Layer │         │  Source Fetch Queue  │
│  (verwisselbaar)    │         │  (BullMQ + Redis)    │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
┌──────────▼───────────────────────────────▼──────────────────┐
│                    Adapter Layer                             │
│  BwbSru | Rechtspraak | LocalReg | EurLex | Cellar | Curia  │
│  Hudoc | OfficialGazette | CouncilOfState | Treaties         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              PostgreSQL (Prisma) + Redis Cache               │
└─────────────────────────────────────────────────────────────┘
```

## Mappenstructuur

```
src/
├── legal/
│   ├── types/           # Jurisdiction, SourceType, LegalDocument, etc.
│   ├── config/          # Bronregister, rechtsgebieden
│   ├── adapters/        # LegalSourceAdapter implementaties
│   ├── services/        # Business logic
│   ├── llm/             # LegalAnalysisModel provider
│   ├── queue/           # Achtergrondwachtrij bronopvragingen
│   └── utils/           # Cache, retry, XML-safe parsing
├── components/juridisch/
├── app/juridisch/       # UI routes
└── app/api/juridisch/   # API routes
prisma/schema.prisma
docker-compose.yml
docs/juridisch/
```

## Adapter-interface

```typescript
interface LegalSourceAdapter {
  id: string;
  name: string;
  jurisdiction: Jurisdiction;
  search(query: LegalSearchQuery): Promise<LegalSearchResult[]>;
  fetchDocument(identifier: string): Promise<LegalDocument>;
  normalize(raw: unknown): LegalDocument;
  healthCheck(): Promise<SourceHealth>;
}
```

Elke adapter implementeert: timeouts, exponential back-off, rate limiting, caching, retries, foutlogging.

## Analysepijplijn (casus)

1. Vrije tekst invoer (+ optionele documentupload)
2. Feitenextractie met labels (feit | stelling | vermoeden | ontbrekend)
3. Tijdlijn generatie
4. Issue tree (civiel | straf | bestuur | EU/EVRM)
5. Zoekquerygeneratie per issue
6. Parallelle bronopvraging via adapters
7. Jurisprudentieanalyse + uitzonderingsdetectie
8. Toepassing op casus (TOEPASSING OP DE CASUS)
9. Tegenargumenten + proceskansindicatie
10. Kwaliteitscontroles (bron + juridisch + taal)

## LLM-provider

```typescript
interface LegalAnalysisModel {
  classifyCase(input: CaseInput): Promise<CaseClassification>;
  extractFacts(input: string): Promise<ExtractedFacts>;
  analyzeAuthorities(input: AuthorityInput): Promise<LegalAnalysis>;
  draftClaim(input: ClaimInput): Promise<ClaimDraft>;
}
```

Standaard: rule-based mock provider (geen externe API vereist). Optioneel: OpenAI/Anthropic via env-configuratie met anonimisering en waarschuwing.

## Beveiliging

- XML parsing zonder external entities (XXE-bescherming)
- Prompt injection bescherming in uploads en bronteksten
- Auditlogs voor bronopvraging en documentgeneratie
- Configureerbare bewaartermijnen
- Geen logging van volledige dossierinhoud

## Fase 1 (huidige implementatie)

| Component | Status |
|-----------|--------|
| BWB SRU (wetten.overheid.nl) | Geïmplementeerd |
| Rechtspraak Open Data | Geïmplementeerd |
| Lokale regelgeving | Geïmplementeerd |
| EUR-Lex webservice | Geïmplementeerd |
| CELLAR REST | Geïmplementeerd |
| CURIA/InfoCuria | Geïmplementeerd |
| HUDOC | Geïmplementeerd |
| Officiële bekendmakingen | Basis (SRU) |
| Verdragenbank | Basis (API) |
| Raad van State | Via Rechtspraak ECLI-filter |
| Definitiezoeker | Geïmplementeerd |
| Casusanalyse + issue tree | Geïmplementeerd |
| Claimgenerator | Geïmplementeerd |
| Proceskansmodel | Geïmplementeerd |
| Export Markdown/DOCX | Geïmplementeerd |
| Docker Compose | Geïmplementeerd |
| Tests (Vitest) | Geïmplementeerd |

## Bekende beperkingen

- LLM-analyse gebruikt standaard rule-based logica; externe LLM vereist configuratie
- Niet alle SRU/EUR-Lex endpoints zijn 24/7 beschikbaar; caching en retries zijn essentieel
- Volledige citatievalidatie vereist ophalen van brontekst (performance-impact)
- Secundaire bronnen zijn uitgesloten in fase 1
- Gebruikersauthenticatie is basis (lokaal); productie vereist OIDC/SSO
