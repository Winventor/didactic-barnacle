import type { CaseAnalysisResult, ClaimDraft } from "../types";

export class ExportService {
  caseAnalysisToMarkdown(analysis: CaseAnalysisResult): string {
    const lines: string[] = [
      "# Juridische casusanalyse",
      "",
      "## 1. Samenvatting van de casus",
      analysis.summary,
      "",
      "## 2. Vastgestelde feiten",
      ...analysis.facts
        .filter((f) => f.label === "BEVESTIGD_FEIT")
        .map((f) => `- ${f.text} [${f.label}]`),
      "",
      "## 3. Stellingen die nog bewijs vereisen",
      ...analysis.claimsRequiringProof.map((f) => `- ${f.text}`),
      "",
      "## 4. Ontbrekende informatie",
      ...analysis.missingInformation.map((m) => `- ${m}`),
      "",
      "## 5. Mogelijke rechtsgebieden",
    ];

    for (const area of analysis.legalAreas) {
      lines.push(`### ${area.area}`);
      lines.push(...area.subAreas.map((s) => `- ${s}`));
    }

    lines.push("", "## 6. Toepasselijke rechtsregels");
    for (const rule of analysis.rules) {
      lines.push(`- **${rule.rule}** [${rule.label}]`);
      lines.push(`  - Voorwaarden: ${rule.conditions.join("; ")}`);
      if (rule.exceptions.length) lines.push(`  - Uitzonderingen: ${rule.exceptions.join("; ")}`);
      for (const s of rule.sources) {
        lines.push(`  - Bron: ${s.title} – ${s.officialUrl}`);
      }
    }

    lines.push("", "## 7. Relevante jurisprudentie");
    for (const j of analysis.jurisprudence) {
      lines.push(`- ${j.ecli ?? "Onbekend"} | ${j.institution} | ${j.date}`);
      lines.push(`  - Kernregel: ${j.coreRule}`);
      lines.push(`  - URL: ${j.url}`);
    }

    lines.push("", "## 8. Toepassing op de casus");
    for (const app of analysis.application) {
      lines.push(`### ${app.title} [${app.label}]`);
      lines.push(app.content);
    }

    lines.push("", "## 9. Bewijsmatrix");
    lines.push("| Feit | Bewijs | Sterkte | Betwist |");
    lines.push("|------|--------|---------|---------|");
    for (const row of analysis.evidenceMatrix) {
      lines.push(`| ${row.fact} | ${row.evidence} | ${row.strength} | ${row.disputed ? "Ja" : "Nee"} |`);
    }

    lines.push("", "## 10. Verwachte tegenargumenten");
    lines.push("| Onderdeel | Argument | Verweer | Antwoord | Bewijs |");
    lines.push("|-----------|----------|---------|----------|--------|");
    for (const ca of analysis.counterArguments) {
      lines.push(
        `| ${ca.element} | ${ca.userArgument} | ${ca.expectedDefense} | ${ca.response} | ${ca.evidenceNeeded} |`
      );
    }

    lines.push("", "## 11. Mogelijke juridische routes");
    lines.push(...analysis.routes.map((r) => `- ${r}`));

    lines.push("", "## 12. Sterkste claim");
    lines.push(analysis.strongestClaim);

    lines.push("", "## 13. Zwakke punten en risico's");
    lines.push(...analysis.weaknesses.map((w) => `- ${w}`));

    lines.push("", "## 14. Indicatieve proceskans");
    if (analysis.successAssessment.quantifiable) {
      lines.push(
        `- Gehele of grotendeels gunstige beslissing: ${analysis.successAssessment.overallRange?.low}–${analysis.successAssessment.overallRange?.high}%`
      );
      lines.push(`- Categorie: ${analysis.successAssessment.category}`);
    } else {
      lines.push(`Proceskans: niet verantwoord kwantificeerbaar`);
      lines.push(`Reden: ${analysis.successAssessment.reason}`);
    }
    lines.push("", analysis.successAssessment.warning);

    lines.push("", "## 15. Acties die de positie kunnen versterken");
    lines.push(...analysis.actions.map((a) => `- ${a}`));

    lines.push("", "## 16. Bronnenlijst");
    for (const s of analysis.sources) {
      lines.push(`- ${s.title} | ${s.officialUrl} | Opgehaald: ${s.fetchedAt}`);
    }

    lines.push(
      "",
      "---",
      `Rechtstoestand beoordeeld per: ${analysis.metadata.assessedAsOf}`,
      `Feitenperiode: ${analysis.metadata.factsPeriodFrom ?? "?"} – ${analysis.metadata.factsPeriodTo ?? "?"}`,
      `Laatste broncontrole: ${analysis.metadata.lastSourceCheck}`
    );

    return lines.join("\n");
  }

  claimToMarkdown(claim: ClaimDraft): string {
    const lines = [`# ${claim.title}`, ""];
    for (const section of claim.sections) {
      lines.push(`## ${section.heading} [${section.label}]`);
      lines.push(section.content);
      lines.push("");
    }
    lines.push("## Waarschuwingen");
    lines.push(...claim.warnings.map((w) => `- ${w}`));
    return lines.join("\n");
  }

  async claimToDocx(claim: ClaimDraft): Promise<Buffer> {
    const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import("docx");
    const children = [
      new Paragraph({ text: claim.title, heading: HeadingLevel.TITLE }),
      ...claim.sections.flatMap((s) => [
        new Paragraph({ text: `${s.heading} [${s.label}]`, heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ children: [new TextRun(s.content)] }),
      ]),
      new Paragraph({ text: "Waarschuwingen", heading: HeadingLevel.HEADING_2 }),
      ...claim.warnings.map((w) => new Paragraph({ children: [new TextRun(w)] })),
    ];

    const doc = new Document({ sections: [{ children }] });
    return Packer.toBuffer(doc);
  }

  async caseAnalysisToDocx(analysis: CaseAnalysisResult): Promise<Buffer> {
    const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import("docx");
    const markdown = this.caseAnalysisToMarkdown(analysis);
    const paragraphs = markdown.split("\n").map((line) => {
      if (line.startsWith("# ")) {
        return new Paragraph({ text: line.slice(2), heading: HeadingLevel.TITLE });
      }
      if (line.startsWith("## ")) {
        return new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_1 });
      }
      if (line.startsWith("### ")) {
        return new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_2 });
      }
      return new Paragraph({ children: [new TextRun(line)] });
    });

    const doc = new Document({ sections: [{ children: paragraphs }] });
    return Packer.toBuffer(doc);
  }
}

export const exportService = new ExportService();
