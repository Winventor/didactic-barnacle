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
        <p className="text-muted-foreground">
          Doorzoekt metadata én volledige tekst van wetgeving (BWB) en jurisprudentie (Rechtspraak Open Data)
        </p>
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

              {result.statutoryDefinition && (
                <div>
                  <h3 className="font-medium mb-1">Wettelijke passage</h3>
                  <p className="text-sm bg-muted/50 rounded-md p-3">{result.statutoryDefinition}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium mb-1">Juridische betekenis</h3>
                <p className="text-sm">{result.legalMeaning}</p>
                <p className="text-xs text-muted-foreground mt-1">Rechtsgebied: {result.legalArea}</p>
                {result.searchScope && (
                  <p className="text-xs text-muted-foreground mt-2">{result.searchScope}</p>
                )}
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
              <h2 className="font-semibold mb-3">Wetgeving (volledige tekst)</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {result.sources.map((s) => (
                  <div key={s.id} className="space-y-2">
                    <SourceCard source={{
                      title: s.title,
                      snippet: s.fragments?.[0]?.text?.slice(0, 220) ?? s.fullText?.slice(0, 200),
                      jurisdiction: s.jurisdiction,
                      sourceType: s.sourceType,
                      authorityLevel: s.authorityLevel,
                      officialUrl: s.officialUrl,
                      identifier: s.identifiers.bwbId ?? s.identifiers.ecli,
                    }} />
                    {s.fragments && s.fragments.length > 1 && (
                      <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                        {s.fragments.slice(1, 3).map((f) => (
                          <li key={f.id}>{f.text.slice(0, 180)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.jurisprudence.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Jurisprudentie</h2>
              <div className="grid gap-3">
                {result.jurisprudence.map((j) => (
                  <Card key={j.ecli ?? j.url}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        <a href={j.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {j.ecli ?? j.institution}
                        </a>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="text-xs text-muted-foreground">
                        {j.institution}
                        {j.date ? ` · ${j.date}` : ""}
                        {j.isLeadingCase ? " · Leidende jurisprudentie" : ""}
                      </p>
                      <p>{j.coreRule}</p>
                      {j.relevantConsiderations.length > 0 && (
                        <ul className="text-xs text-muted-foreground list-disc pl-5">
                          {j.relevantConsiderations.map((c, i) => (
                            <li key={i}>{c.slice(0, 200)}</li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
