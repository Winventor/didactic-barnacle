"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClaimLabelBadge } from "@/components/juridisch/claim-label-badge";
import { TEST_CASES } from "@/legal/seed/test-cases";
import {
  generateClaim,
  claimToMarkdown,
  downloadTextFile,
} from "@/legal/client/browser-api";
import type { ClaimDraft, ClaimDocumentType } from "@/legal/types";
import { Loader2, Download } from "lucide-react";

const DOCUMENT_TYPES: { value: ClaimDocumentType; label: string }[] = [
  { value: "SOMMATIE", label: "Sommatie" },
  { value: "AANSPRAKELIJKSTELLING", label: "Aansprakelijkstelling" },
  { value: "CONCEPTDAGVAARDING", label: "Conceptdagvaarding" },
  { value: "CONCEPTVERZOKSCHRIFT", label: "Conceptverzoekschrift" },
  { value: "KORT_GEDING", label: "Kort geding" },
  { value: "BEZWAAR", label: "Bezwaar" },
  { value: "BEROEPSCHRIFT", label: "Beroepschrift" },
  { value: "HANDHAVING_VERZOEK", label: "Verzoek om handhaving" },
  { value: "AANGIFTE_ONDERBOUWING", label: "Aangifteonderbouwing" },
  { value: "JURIDISCHE_NOTITIE", label: "Juridische notitie" },
  { value: "PROCESKANSEN_MEMO", label: "Proceskansenmemo" },
];

export default function ClaimPage() {
  const [narrative, setNarrative] = useState("");
  const [documentType, setDocumentType] = useState<ClaimDocumentType>("JURIDISCHE_NOTITIE");
  const [tone, setTone] = useState<"FORMEEL" | "GEMATIGD" | "BEWIJSVEILIG">("FORMEEL");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [loading, setLoading] = useState(false);
  const [claim, setClaim] = useState<ClaimDraft | null>(null);

  async function handleGenerate() {
    if (!narrative.trim()) return;
    setLoading(true);
    try {
      setClaim(
        await generateClaim({
          narrative,
          documentType,
          tone,
          desiredOutcome: desiredOutcome || "Juridische actie",
        })
      );
    } finally {
      setLoading(false);
    }
  }

  function handleExportMarkdown() {
    if (!claim) return;
    downloadTextFile("claim.md", claimToMarkdown(claim));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Genereer juridische claim</h1>
        <p className="text-muted-foreground">Conceptdocumenten met bronverwijzingen en waarschuwingen</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TEST_CASES.slice(0, 4).map((tc) => (
          <Button key={tc.id} variant="outline" size="sm" onClick={() => setNarrative(tc.narrative)}>
            {tc.title}
          </Button>
        ))}
      </div>

      <textarea
        className="w-full min-h-[150px] rounded-md border bg-background p-3 text-sm"
        placeholder="Beschrijf feiten en gewenste uitkomst..."
        value={narrative}
        onChange={(e) => setNarrative(e.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as ClaimDocumentType)}
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={tone}
          onChange={(e) => setTone(e.target.value as typeof tone)}
        >
          <option value="FORMEEL">Formeel (sterkste versie)</option>
          <option value="GEMATIGD">Gematigd</option>
          <option value="BEWIJSVEILIG">Bewijsveilig</option>
        </select>
        <input
          className="rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Gewenste uitkomst"
          value={desiredOutcome}
          onChange={(e) => setDesiredOutcome(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleGenerate} disabled={loading || !narrative.trim()}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Genereren
        </Button>
        {claim && (
          <Button variant="outline" onClick={handleExportMarkdown}>
            <Download className="h-4 w-4 mr-2" /> Markdown
          </Button>
        )}
      </div>

      {claim && (
        <Card>
          <CardHeader><CardTitle>{claim.title}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {claim.sections.map((s) => (
              <div key={s.heading}>
                <h3 className="font-medium flex items-center gap-2">
                  {s.heading} <ClaimLabelBadge label={s.label} />
                </h3>
                <pre className="text-sm whitespace-pre-wrap mt-1 font-sans">{s.content}</pre>
              </div>
            ))}
            <div className="legal-warning">
              {claim.warnings.map((w) => <p key={w}>{w}</p>)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
