import { legalModel } from "../llm/provider";
import { searchOrchestrator } from "./search-orchestrator";
import { issueTreeService } from "./issue-tree-service";
import { successAssessmentService } from "./success-assessment-service";
import type { CaseInput, CaseAnalysisResult, LegalDocument } from "../types";
import { EXCEPTION_PHRASES } from "../config/legal-areas";

export class CaseAnalysisService {
  async analyze(input: CaseInput): Promise<CaseAnalysisResult> {
    const classification = await legalModel.classifyCase(input);
    const extractedFacts = await legalModel.extractFacts(input.narrative);
    const issueTree = issueTreeService.build(input.narrative);
    const searchQueries = issueTreeService.generateSearchQueries(issueTree);

    const allSearchResults = await Promise.all(
      searchQueries.slice(0, 8).map((q) =>
        searchOrchestrator.searchByPriority({ text: q, limit: 5 })
      )
    );

    const uniqueResults = new Map<string, (typeof allSearchResults)[0][0]>();
    for (const results of allSearchResults) {
      for (const r of results) {
        uniqueResults.set(`${r.adapterId}-${r.id}`, r);
      }
    }

    const sources: LegalDocument[] = [];
    for (const result of [...uniqueResults.values()].slice(0, 15)) {
      const adapter = (await import("../adapters")).getAdapter(result.adapterId);
      if (adapter && result.identifier) {
        try {
          sources.push(await adapter.fetchDocument(result.identifier));
        } catch {
          sources.push({
            id: result.id,
            adapterId: result.adapterId,
            title: result.title,
            jurisdiction: result.jurisdiction,
            sourceType: result.sourceType,
            authorityLevel: result.authorityLevel,
            officialUrl: result.officialUrl,
            identifiers: {},
            fetchedAt: new Date().toISOString(),
          });
        }
      }
    }

    const analysis = await legalModel.analyzeAuthorities({
      caseFacts: extractedFacts,
      issueTree: issueTree.children,
      sources,
    });

    const jurisprudenceWithExceptions = analysis.jurisprudence.map((j) => ({
      ...j,
      relevantConsiderations: this.detectExceptions(j.coreRule),
    }));

    const successAssessment = successAssessmentService.assess({
      facts: extractedFacts,
      rules: analysis.rules,
      jurisprudence: jurisprudenceWithExceptions,
      sources,
    });

    const counterArguments = this.generateCounterArguments(input.narrative, extractedFacts);
    const evidenceMatrix = extractedFacts.facts.map((f) => ({
      fact: f.text,
      evidence: f.label === "BEVESTIGD_FEIT" ? "Door gebruiker aangegeven als vaststaand" : "Nog te onderbouwen",
      strength: f.label === "BEVESTIGD_FEIT" ? "Middel" : "Zwak",
      disputed: f.label === "STELLING_GEBRUIKER",
    }));

    const now = new Date().toISOString();
    const dates = extractedFacts.timeline.map((t) => t.date).filter(Boolean);

    return {
      summary: this.generateSummary(input.narrative, classification),
      facts: extractedFacts.facts,
      claimsRequiringProof: extractedFacts.facts.filter(
        (f) => f.label === "STELLING_GEBRUIKER" || f.label === "VERMOEDEN"
      ),
      missingInformation: extractedFacts.missingInformation,
      legalAreas: classification.legalAreas.map((area) => ({
        area,
        subAreas: classification.subAreas,
      })),
      rules: analysis.rules,
      jurisprudence: jurisprudenceWithExceptions,
      application: analysis.application,
      evidenceMatrix,
      counterArguments,
      routes: this.recommendRoutes(classification.legalAreas),
      strongestClaim: this.determineStrongestClaim(classification.legalAreas),
      weaknesses: this.identifyWeaknesses(extractedFacts),
      successAssessment,
      actions: this.recommendActions(extractedFacts),
      sources,
      issueTree,
      timeline: extractedFacts.timeline,
      metadata: {
        assessedAsOf: now.split("T")[0],
        factsPeriodFrom: dates[0],
        factsPeriodTo: dates[dates.length - 1],
        lastSourceCheck: now,
      },
    };
  }

  private detectExceptions(text: string): string[] {
    const lower = text.toLowerCase();
    return EXCEPTION_PHRASES.filter((p) => lower.includes(p));
  }

  private generateSummary(narrative: string, classification: { legalAreas: string[] }): string {
    const preview = narrative.slice(0, 200).trim();
    return (
      `${preview}${narrative.length > 200 ? "..." : ""} ` +
      `Mogelijke rechtsgebieden: ${classification.legalAreas.join(", ")}.`
    );
  }

  private generateCounterArguments(
    narrative: string,
    facts: Awaited<ReturnType<typeof legalModel.extractFacts>>
  ) {
    const rows = [];
    const lower = narrative.toLowerCase();

    if (lower.includes("provoc")) {
      rows.push({
        element: "Eigen aandeel",
        userArgument: "Wederpartij provoceert structureel",
        expectedDefense: "Eigen aandeel of provocatie door gebruiker",
        response: "Benadruk stelselmatigheid en disproportionele reactie",
        evidenceNeeded: "Getuigenverklaringen, tijdlijn",
      });
    }

    if (facts.missingInformation.length > 0) {
      rows.push({
        element: "Bewijs",
        userArgument: "Feiten zoals beschreven",
        expectedDefense: "Onvoldoende bewijs, betwisting feiten",
        response: "Bewijs verzamelen en vastleggen",
        evidenceNeeded: facts.missingInformation.join(", "),
      });
    }

    rows.push({
      element: "Proportionaliteit",
      userArgument: "Gewenste maatregel/rechtsmiddel",
      expectedDefense: "Disproportionele vordering",
      response: "Toon proportionaliteit en subsidiariteit aan",
      evidenceNeeded: "Vergelijkbare uitspraken",
    });

    return rows;
  }

  private recommendRoutes(areas: string[]): string[] {
    const routes: string[] = [];
    if (areas.includes("CIVIEL")) routes.push("Civiele procedure (bodem/kort geding)");
    if (areas.includes("STRAF")) routes.push("Aangifte bij politie");
    if (areas.includes("BESTUUR")) routes.push("Verzoek om handhaving bij gemeente", "Bezwaar/beroep");
    if (areas.includes("VERDRAG")) routes.push("Nationale procedure met EVRM-argument");
    return routes;
  }

  private determineStrongestClaim(areas: string[]): string {
    if (areas.includes("BESTUUR") && areas.includes("CIVIEL"))
      return "Combinatie: verzoek om handhaving + civielrechtelijke vordering";
    if (areas.includes("STRAF")) return "Strafrechtelijke aangifte (indien bewijs voldoende)";
    if (areas.includes("CIVIEL")) return "Civielrechtelijke vordering onrechtmatige daad";
    return "Nader juridisch onderzoek vereist";
  }

  private identifyWeaknesses(facts: Awaited<ReturnType<typeof legalModel.extractFacts>>): string[] {
    const weaknesses: string[] = [];
    if (facts.missingInformation.length > 0) weaknesses.push(...facts.missingInformation.map((m) => `Ontbreekt: ${m}`));
    const onlyUserClaims = facts.facts.every((f) => f.label === "STELLING_GEBRUIKER");
    if (onlyUserClaims) weaknesses.push("Alle feiten zijn stellingen van de gebruiker zonder extern bewijs");
    return weaknesses;
  }

  private recommendActions(facts: Awaited<ReturnType<typeof legalModel.extractFacts>>): string[] {
    const actions = ["Documenteer alle contactmomenten chronologisch"];
    if (facts.missingInformation.includes("Beschikbaar bewijs"))
      actions.push("Verzamel bewijs: berichten, foto's, getuigenverklaringen");
    if (facts.missingInformation.some((m) => m.includes("gemeente")))
      actions.push("Geef gemeente/provincie op voor lokale regelgeving");
    actions.push("Raadpleeg een advocaat voor definitief juridisch advies");
    return actions;
  }
}

export const caseAnalysisService = new CaseAnalysisService();
