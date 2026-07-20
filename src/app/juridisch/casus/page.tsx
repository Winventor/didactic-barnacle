"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceCard } from "@/components/juridisch/source-card";
import { ClaimLabelBadge } from "@/components/juridisch/claim-label-badge";
import { TEST_CASES } from "@/legal/seed/test-cases";
import type { CaseAnalysisResult } from "@/legal/types";
import { Loader2, Download, FileText } from "lucide-react";

import type { IssueTreeNode } from "@/legal/types";

function IssueTreeView({ node, depth = 0 }: { node: IssueTreeNode; depth?: number }) {
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <p className="text-sm font-medium">{node.label}</p>
      {node.children.map((child) => (
        <IssueTreeView key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function CasusPage() {
  const [narrative, setNarrative] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CaseAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!narrative.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/juridisch/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ narrative, municipality: municipality || undefined }),
      });
      if (!res.ok) throw new Error("Analyse mislukt");
      setAnalysis(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onbekende fout");
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(format: "markdown" | "docx") {
    const res = await fetch("/api/juridisch/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ narrative, municipality, format }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `casusanalyse.${format === "markdown" ? "md" : "docx"}`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analyseer mijn casus</h1>
        <p className="text-muted-foreground">Beschrijf uw situatie; het systeem structureert en analyseert</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TEST_CASES.map((tc) => (
          <Button key={tc.id} variant="outline" size="sm" onClick={() => {
            setNarrative(tc.narrative);
            if (tc.municipality) setMunicipality(tc.municipality);
          }}>
            {tc.title}
          </Button>
        ))}
      </div>

      <textarea
        className="w-full min-h-[200px] rounded-md border bg-background p-3 text-sm"
        placeholder="Beschrijf uw casus in vrije tekst..."
        value={narrative}
        onChange={(e) => setNarrative(e.target.value)}
      />

      <input
        className="w-full max-w-sm rounded-md border bg-background px-3 py-2 text-sm"
        placeholder="Gemeente (optioneel, voor lokale regelgeving)"
        value={municipality}
        onChange={(e) => setMunicipality(e.target.value)}
      />

      <div className="flex gap-2">
        <Button onClick={handleAnalyze} disabled={loading || !narrative.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
          Analyseren
        </Button>
        {analysis && (
          <>
            <Button variant="outline" onClick={() => handleExport("markdown")}>
              <Download className="h-4 w-4 mr-2" /> Markdown
            </Button>
            <Button variant="outline" onClick={() => handleExport("docx")}>
              <Download className="h-4 w-4 mr-2" /> DOCX
            </Button>
          </>
        )}
      </div>

      {error && <p className="text-destructive">{error}</p>}

      {analysis && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Samenvatting</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{analysis.summary}</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Issue tree</CardTitle></CardHeader>
            <CardContent><IssueTreeView node={analysis.issueTree} /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Feiten</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {analysis.facts.map((f) => (
                <div key={f.id} className="text-sm border-l-2 pl-3 border-muted">
                  <span className="text-xs text-muted-foreground">{f.label}</span>
                  <p>{f.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {analysis.missingInformation.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Ontbrekende informatie</CardTitle></CardHeader>
              <CardContent>
                <ul className="text-sm list-disc pl-5">
                  {analysis.missingInformation.map((m) => <li key={m}>{m}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                Indicatieve proceskans{" "}
                <ClaimLabelBadge label="TOEPASSING_OP_CASUS" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysis.successAssessment.quantifiable ? (
                <p className="text-2xl font-bold">
                  {analysis.successAssessment.overallRange?.low}–{analysis.successAssessment.overallRange?.high}%
                </p>
              ) : (
                <p className="text-sm">Niet verantwoord kwantificeerbaar: {analysis.successAssessment.reason}</p>
              )}
              <p className="text-xs text-muted-foreground">{analysis.successAssessment.warning}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Bronnen ({analysis.sources.length})</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {analysis.sources.slice(0, 8).map((s) => (
                <SourceCard key={s.id} source={{
                  title: s.title,
                  jurisdiction: s.jurisdiction,
                  sourceType: s.sourceType,
                  authorityLevel: s.authorityLevel,
                  officialUrl: s.officialUrl,
                  identifier: s.identifiers.bwbId ?? s.identifiers.ecli,
                }} />
              ))}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Rechtstoestand beoordeeld per: {analysis.metadata.assessedAsOf} |
            Laatste broncontrole: {analysis.metadata.lastSourceCheck}
          </p>
        </div>
      )}
    </div>
  );
}
