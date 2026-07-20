import { searchOrchestrator } from "./search-orchestrator";
import type { DefinitionResult, LegalSearchQuery } from "../types";

const DEFINITION_KNOWLEDGE: Record<
  string,
  Partial<DefinitionResult> & { searchTerms: string[] }
> = {
  intimidatie: {
    searchTerms: ["bedreiging", "dwang", "belaging", "mishandeling"],
    status: {
      inStatute: false,
      developedInCaseLaw: true,
      colloquialTerm: true,
      variesByArea: true,
      description:
        "Geen algemeen zelfstandig strafbaar feit onder exact deze benaming. " +
        "Kan feitelijk onderdeel vormen van onder meer bedreiging, dwang, belaging, mishandeling, " +
        "afpersing of discriminerende gedragingen. Kan civielrechtelijk onrechtmatig zijn zonder strafbaar feit.",
    },
    legalMeaning:
      "Omgangstaalterm voor gedrag dat als bedreigend, beklemmend of angst opwekkend wordt ervaren. " +
      "Juridische kwalificatie hangt af van feitelijke gedragingen en rechtsgebied.",
    legalArea: "Civiel en strafrecht",
    elements: ["Gedraging", "Ervaring van bedreiging/intimidatie", "Context en herhaling"],
    exceptions: ["Gerechtvaardigd belang", "Vrijheid van meningsuiting (contextafhankelijk)"],
    relatedTerms: [
      { term: "bedreiging", difference: "Vereist dreiging met bepaald misdrijf (Sr art. 285)" },
      { term: "belaging", difference: "Vereist wederrechtelijke stelselmatigheid (Sr art. 285b)" },
      { term: "onrechtmatige daad", difference: "Civielrechtelijk, bredere maatschappelijke zorgvuldigheid" },
    ],
    examples: ["Herhaald dreigend gedrag", "Fysiek intimiderend postureren"],
    counterExamples: ["Eenmalig verhitte woordenwisseling zonder dreiging"],
    evidencePoints: ["Getuigenverklaringen", "Berichten", "Foto/video", "Aangifte"],
  },
  belaging: {
    searchTerms: ["belaging", "stelselmatig", "285b"],
    status: {
      inStatute: true,
      developedInCaseLaw: true,
      colloquialTerm: false,
      variesByArea: false,
      description: "Wél strafbaar gesteld in artikel 285b Sr.",
    },
    legalMeaning:
      "Wederrechtelijk stelselmatig opzettelijk inbreuk maken op eens anders persoonlijke levenssfeer " +
      "met het oogmerk die ander te dwingen iets te doen, niet te doen, te dulden of vrees aan te jagen.",
    legalArea: "Strafrecht",
    elements: ["Stelselmatigheid", "Wederrechtelijkheid", "Opzet", "Oogmerk", "Inbreuk op persoonlijke levenssfeer"],
    mainRule: "Artikel 285b Wetboek van Strafrecht",
    exceptions: ["Gerechtvaardigd belang (zeldzaam)", "Noodtoestand"],
    relatedTerms: [
      { term: "intimidatie", difference: "Geen zelfstandig strafbaar feit" },
      { term: "bedreiging", difference: "Vereist dreiging met misdrijf" },
    ],
    examples: ["Herhaald ongewenst contact", "Stelselmatig volgen"],
    counterExamples: ["Enkele ongewenste contactpoging"],
    evidencePoints: ["Aantal contactmomenten", "Tijdsduur", "Impact op slachtoffer"],
  },
  bedreiging: {
    searchTerms: ["bedreiging", "285"],
    status: {
      inStatute: true,
      developedInCaseLaw: true,
      colloquialTerm: false,
      variesByArea: false,
      description: "Strafbaar gesteld in artikel 285 Sr.",
    },
    legalMeaning:
      "Bedreiging met enig misdrijf tegen het leven gericht, zware mishandeling of brandstichting.",
    legalArea: "Strafrecht",
    elements: ["Dreiging", "Misdrijf", "Vrees bij bedreigde (objectieve toets)"],
    mainRule: "Artikel 285 Wetboek van Strafrecht",
    exceptions: ["Vrijheid van meningsuiting (context)", "Noodweer"],
    relatedTerms: [
      { term: "intimidatie", difference: "Breder, niet altijd strafbaar" },
    ],
    examples: ["Dreigen met geweld", "Dreigen met brandstichting"],
    counterExamples: ["Algemene woede-uiting zonder concrete dreiging"],
    evidencePoints: ["Letterlijke dreigementen", "Getuigen", "Opname"],
  },
  "onrechtmatige daad": {
    searchTerms: ["onrechtmatige daad", "6:162", "zorgvuldigheid"],
    status: {
      inStatute: true,
      developedInCaseLaw: true,
      colloquialTerm: false,
      variesByArea: false,
      description: "Geregeld in artikel 6:162 BW.",
    },
    legalMeaning:
      "Onrechtmatige gedraging jegens een ander die hem in zijn persoonlijke veiligheid, " +
      "in zijn vrijheid of in zijn vermogen brengt, waardoor deze ander nadeel lijdt.",
    legalArea: "Civielrecht (verbintenissenrecht)",
    elements: [
      "Onrechtmatige gedraging",
      "Toerekenbaarheid",
      "Relativiteit",
      "Schade",
      "Causaliteit",
    ],
    mainRule: "Artikel 6:162 Burgerlijk Wetboek",
    exceptions: ["Eigen schuld", "Gerechtvaardigd belang", "Toestemming"],
    relatedTerms: [
      { term: "strafbaar feit", difference: "Civielrechtelijk ≠ strafrechtelijk strafbaar" },
    ],
    examples: ["Onzorgvuldig handelen", "Normschending"],
    counterExamples: ["Sociaal aanvaardbaar gedrag"],
    evidencePoints: ["Schade", "Causaal verband", "Normschending"],
  },
  provoceren: {
    searchTerms: ["provocatie", "onrechtmatige daad", "burenrecht"],
    status: {
      inStatute: false,
      developedInCaseLaw: true,
      colloquialTerm: true,
      variesByArea: true,
      description: "Geen zelfstandig juridisch begrip; kan onder onrechtmatige daad vallen.",
    },
    legalMeaning:
      "Gedrag dat bedoeld is om een reactie uit te lokken. Juridisch relevant als normschending " +
      "of inbreuk op woongenot/burenrecht.",
    legalArea: "Civielrecht (burenrecht)",
    elements: ["Gedraging", "Opzet tot provocatie", "Normschending", "Schade of hinder"],
    exceptions: ["Eigen aandeel geprovoceerde partij"],
    relatedTerms: [
      { term: "onrechtmatige daad", difference: "Juridische grondslag" },
      { term: "woongenot", difference: "Specifiek burenrechtelijk aspect" },
    ],
    examples: ["Herhaald provocerend gedrag bij burenconflict"],
    counterExamples: ["Eenmalig vervelend gedrag"],
    evidencePoints: ["Getuigen", "Patroon van gedrag", "Meldingen"],
  },
};

export class DefinitionService {
  async search(term: string, options?: Partial<LegalSearchQuery>): Promise<DefinitionResult> {
    const normalized = term.toLowerCase().trim();
    const knowledge = DEFINITION_KNOWLEDGE[normalized];

    const searchTerms = knowledge?.searchTerms ?? [term];
    const sourceResults = await searchOrchestrator.searchAll({
      text: searchTerms.join(" "),
      limit: 10,
      ...options,
    });

    const sources = await Promise.all(
      sourceResults.slice(0, 5).map(async (r) => {
        const adapter = (await import("../adapters")).getAdapter(r.adapterId);
        if (adapter && r.identifier) {
          try {
            return await adapter.fetchDocument(r.identifier);
          } catch {
            return null;
          }
        }
        return null;
      })
    );

    const validSources = sources.filter(Boolean) as NonNullable<(typeof sources)[0]>[];

    const jurisprudenceResults = await searchOrchestrator.searchAll(
      { text: `${term} jurisprudentie`, limit: 5 },
      ["rechtspraak"]
    );

    return {
      term,
      status: knowledge?.status ?? {
        inStatute: false,
        developedInCaseLaw: false,
        colloquialTerm: true,
        variesByArea: false,
        description: "Geen specifieke definitie in het systeem; zoekresultaten uit officiële bronnen.",
      },
      legalMeaning: knowledge?.legalMeaning ?? `Zoekresultaten voor: ${term}`,
      legalArea: knowledge?.legalArea ?? "Nader te bepalen",
      elements: knowledge?.elements ?? [],
      mainRule: knowledge?.mainRule,
      exceptions: knowledge?.exceptions ?? [],
      relatedTerms: knowledge?.relatedTerms ?? [],
      examples: knowledge?.examples ?? [],
      counterExamples: knowledge?.counterExamples ?? [],
      evidencePoints: knowledge?.evidencePoints ?? [],
      sources: validSources,
      jurisprudence: jurisprudenceResults.map((r) => ({
        ecli: r.identifier,
        institution: "Nederlandse rechter",
        date: r.date ?? "",
        coreRule: r.snippet,
        similarities: [],
        differences: [],
        outcome: "Nader te analyseren",
        relevantConsiderations: [],
        url: r.officialUrl,
        isLeadingCase: r.identifier?.includes(":HR:") ?? false,
      })),
    };
  }
}

export const definitionService = new DefinitionService();
