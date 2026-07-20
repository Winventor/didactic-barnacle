"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceCard } from "@/components/juridisch/source-card";
import { ClaimLabelBadge } from "@/components/juridisch/claim-label-badge";
import { searchDefinitions } from "@/legal/client/browser-api";
import type { DefinitionResult } from "@/legal/types";
import { Search, Loader2 } from "lucide-react";

const SUGGESTED_TERMS = [
  "intimidatie",
  "belaging",
  "bedreiging",
  "onrechtmatige daad",
  "provoceren",
  "proportionaliteit",
  "woonoverlast",
];

export default function DefinitiesPage() {
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DefinitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(searchTerm?: string) {
    const q = searchTerm ?? term;
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setResult(await searchDefinitions(q));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onbekende fout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Definitie zoeken</h1>
        <p className="text-muted-foreground">Zoek juridische definities en rechtsbegrippen</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Bijv. intimidatie, belaging, onrechtmatige daad..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={() => handleSearch()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTED_TERMS.map((t) => (
          <Button key={t} variant="outline" size="sm" onClick={() => { setTerm(t); handleSearch(t); }}>
            {t}
          </Button>
        ))}
      </div>

      {error && <p className="text-destructive">{error}</p>}

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{result.term}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Status</h3>
                <p className="text-sm">{result.status.description}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  {result.status.inStatute && <span className="label-bron">In de wet</span>}
                  {result.status.developedInCaseLaw && <span className="label-afgeleid">Jurisprudentie</span>}
                  {result.status.colloquialTerm && <span className="rounded bg-muted px-2 py-0.5">Omgangstaal</span>}
                  {result.status.variesByArea && <span className="rounded bg-muted px-2 py-0.5">Verschilt per rechtsgebied</span>}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-1">Juridische betekenis</h3>
                <p className="text-sm">{result.legalMeaning}</p>
                <p className="text-xs text-muted-foreground mt-1">Rechtsgebied: {result.legalArea}</p>
              </div>

              {result.mainRule && (
                <div>
                  <h3 className="font-medium mb-1">Hoofdregel <ClaimLabelBadge label="BRON" /></h3>
                  <p className="text-sm">{result.mainRule}</p>
                </div>
              )}

              {result.elements.length > 0 && (
                <div>
                  <h3 className="font-medium mb-1">Bestanddelen / voorwaarden</h3>
                  <ul className="text-sm list-disc pl-5">{result.elements.map((e) => <li key={e}>{e}</li>)}</ul>
                </div>
              )}

              {result.exceptions.length > 0 && (
                <div>
                  <h3 className="font-medium mb-1">Uitzonderingen</h3>
                  <ul className="text-sm list-disc pl-5">{result.exceptions.map((e) => <li key={e}>{e}</li>)}</ul>
                </div>
              )}

              {result.relatedTerms.length > 0 && (
                <div>
                  <h3 className="font-medium mb-1">Verwante begrippen</h3>
                  {result.relatedTerms.map((r) => (
                    <p key={r.term} className="text-sm"><strong>{r.term}:</strong> {r.difference}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {result.sources.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Bronnen</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {result.sources.map((s) => (
                  <SourceCard key={s.id} source={{
                    title: s.title,
                    snippet: s.fullText?.slice(0, 200),
                    jurisdiction: s.jurisdiction,
                    sourceType: s.sourceType,
                    authorityLevel: s.authorityLevel,
                    officialUrl: s.officialUrl,
                    identifier: s.identifiers.bwbId ?? s.identifiers.ecli,
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
