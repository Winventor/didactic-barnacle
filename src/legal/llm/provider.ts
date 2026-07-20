import type { LegalAnalysisModel, CaseInput, CaseClassification, ExtractedFacts, AuthorityInput, LegalAnalysis, ClaimInput, ClaimDraft } from "../types";
import { LEGAL_AREAS } from "../config/legal-areas";

const CIVIEL_KEYWORDS = [
  "onrechtmatige daad", "schade", "aansprakelijk", "buren", "huur", "contract",
  "overeenkomst", "dwangsom", "kort geding", "verbod", "gebod", "woongenot",
  "contactverbod", "terreinverbod", "rectificatie",
];
const STRAF_KEYWORDS = [
  "aangifte", "strafbaar", "bedreiging", "belaging", "dwang", "mishandeling",
  "vernieling", "huisvredebreuk", "belediging", "intimidatie", "provocer",
  "politie", "officier van justitie", "tenlastelegging",
];
const BESTUUR_KEYWORDS = [
  "gemeente", "burgemeester", "handhaving", "woonoverlast", "apv", "bezwaar",
  "beroep", "besluit", "beschikking", "awb", "bestuursorgaan", "omgevingsrecht",
  "openbare orde", "last onder dwangsom",
];
const EU_KEYWORDS = ["eu-", "europese unie", "verordening", "richtlijn", "celex", "handvest"];
const EVRM_KEYWORDS = ["evrm", "mensenrechten", "artikel 8", "artikel 6", "artikel 10", "ehrm"];

export class RuleBasedLegalModel implements LegalAnalysisModel {
  async classifyCase(input: CaseInput): Promise<CaseClassification> {
    const text = input.narrative.toLowerCase();
    const areas: CaseClassification["legalAreas"] = [];
    const subAreas: string[] = [];

    if (CIVIEL_KEYWORDS.some((k) => text.includes(k))) {
      areas.push("CIVIEL");
      subAreas.push(...LEGAL_AREAS.find((a) => a.id === "civiel")!.subAreas.filter((s) => text.includes(s.split(" ")[0])));
    }
    if (STRAF_KEYWORDS.some((k) => text.includes(k))) {
      areas.push("STRAF");
      subAreas.push(...LEGAL_AREAS.find((a) => a.id === "straf")!.subAreas.filter((s) => text.includes(s)));
    }
    if (BESTUUR_KEYWORDS.some((k) => text.includes(k))) {
      areas.push("BESTUUR");
      subAreas.push(...LEGAL_AREAS.find((a) => a.id === "bestuur")!.subAreas.filter((s) => text.includes(s.split(" ")[0])));
    }
    if (EU_KEYWORDS.some((k) => text.includes(k))) areas.push("EU");
    if (EVRM_KEYWORDS.some((k) => text.includes(k))) {
      areas.push("VERDRAG");
      areas.push("CONSTITUTIONEEL");
    }

    if (areas.length === 0) areas.push("CIVIEL");

    return {
      legalAreas: [...new Set(areas)],
      subAreas: [...new Set(subAreas)],
      confidence: areas.length > 1 ? "MIDDEL" : "HOOG",
    };
  }

  async extractFacts(input: string): Promise<ExtractedFacts> {
    const sentences = input.split(/[.!?\n]+/).filter((s) => s.trim().length > 10);
    const datePattern = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}\s+\w+\s+\d{4}/g;

    const facts = sentences.map((s, i) => {
      const trimmed = s.trim();
      const hasDate = datePattern.test(trimmed);
      let label: ExtractedFacts["facts"][0]["label"] = "STELLING_GEBRUIKER";
      if (trimmed.match(/volgens|blijkt uit|is vastgesteld|heeft erkend/i)) {
        label = "BEVESTIGD_FEIT";
      } else if (trimmed.match(/mogelijk|vermoedelijk|lijkt/i)) {
        label = "VERMOEDEN";
      } else if (trimmed.match(/denk|vind|meen|interpret/i)) {
        label = "INTERPRETATIE";
      }

      return {
        id: `fact-${i}`,
        text: trimmed,
        label,
        date: hasDate ? trimmed.match(datePattern)?.[0] : undefined,
        confidence: label === "BEVESTIGD_FEIT" ? "HOOG" as const : "MIDDEL" as const,
      };
    });

    const timeline = facts
      .filter((f) => f.date)
      .map((f) => ({
        date: f.date!,
        description: f.text,
        certainty: f.confidence,
        legalRelevance: "Nader te bepalen",
      }));

    const parties: ExtractedFacts["parties"] = [];
    const partyPatterns = [
      { pattern: /buur(man|vrouw|en)/i, role: "buur" },
      { pattern: /gemeente/i, role: "bestuursorgaan" },
      { pattern: /burgemeester/i, role: "bestuursorgaan" },
      { pattern: /politie/i, role: "handhaver" },
    ];
    for (const { pattern, role } of partyPatterns) {
      if (pattern.test(input)) parties.push({ name: input.match(pattern)?.[0] ?? role, role });
    }

    const missingInformation: string[] = [];
    if (!input.match(/datum|sinds|op \d/i)) missingInformation.push("Exacte data van gebeurtenissen");
    if (!input.match(/bewijs|foto|video|getuige|aangifte|proces-verbaal/i))
      missingInformation.push("Beschikbaar bewijs");
    if (!input.match(/gemeente|woonplaats|adres/i))
      missingInformation.push("Geografische context (gemeente/provincie) voor lokale regelgeving");

    return { facts, timeline, missingInformation, parties };
  }

  async analyzeAuthorities(input: AuthorityInput): Promise<LegalAnalysis> {
    const rules = input.sources
      .filter((s) => s.sourceType.includes("WET") || s.sourceType === "AMVB" || s.sourceType.includes("VERORDENING"))
      .slice(0, 5)
      .map((s) => ({
        rule: s.title,
        conditions: ["Nader te analyseren op basis van brontekst"],
        exceptions: [],
        label: "BRON" as const,
        sources: [s],
      }));

    const jurisprudence = input.sources
      .filter((s) => s.sourceType.includes("JURISPRUDENTIE"))
      .slice(0, 5)
      .map((s) => ({
        ecli: s.identifiers.ecli,
        institution: s.institution ?? "Nederlandse rechter",
        date: s.date ?? "",
        coreRule: s.title,
        similarities: ["Feitelijk patroon vergelijkbaar met ingediende casus"],
        differences: ["Details van de casus kunnen afwijken"],
        outcome: "Nader te analyseren",
        relevantConsiderations: [],
        url: s.officialUrl,
        isLeadingCase: s.identifiers.ecli?.includes(":HR:") ?? false,
      }));

    return {
      rules,
      jurisprudence,
      application: [
        {
          title: "Toepassing op de casus",
          content:
            "Op basis van de ingediende feiten en gevonden bronnen is een nadere juridische analyse vereist. " +
            "Onderstaande conclusies zijn indicatief en vormen geen juridisch advies.",
          label: "TOEPASSING_OP_CASUS",
          citations: [],
        },
      ],
      counterArguments: [],
      recommendedRoutes: ["Nader juridisch onderzoek", "Bewijs verzamelen"],
    };
  }

  async draftClaim(input: ClaimInput): Promise<ClaimDraft> {
    const sections: ClaimDraft["sections"] = [
      {
        heading: "Partijen",
        content: input.facts.parties.map((p) => `${p.role}: ${p.name}`).join("\n") || "Nader in te vullen",
        label: "TOEPASSING_OP_CASUS",
      },
      {
        heading: "Feiten",
        content: input.facts.facts
          .filter((f) => f.label !== "INTERPRETATIE")
          .map((f) => `- ${f.text}`)
          .join("\n"),
        label: "TOEPASSING_OP_CASUS",
      },
      {
        heading: "Juridisch kader",
        content: input.caseAnalysis.rules.map((r) => r.rule).join("\n") || "Nader te bepalen",
        label: "BRON",
      },
      {
        heading: "Vordering",
        content: input.desiredOutcome,
        label: "TOEPASSING_OP_CASUS",
      },
    ];

    return {
      title: `Concept ${input.documentType.replace(/_/g, " ").toLowerCase()}`,
      sections,
      citations: [],
      warnings: [
        "Dit is een conceptdocument, geen juridisch advies.",
        "Controleer alle feiten en bronverwijzingen voordat u dit document gebruikt.",
        "Geen garantie op proceswinst.",
      ],
    };
  }
}

export const legalModel = new RuleBasedLegalModel();
