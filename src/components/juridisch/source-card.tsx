import type { LegalSearchResult } from "@/legal/types";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SourceCardProps {
  source: LegalSearchResult | {
    title: string;
    snippet?: string;
    jurisdiction: string;
    sourceType: string;
    authorityLevel: string;
    officialUrl: string;
    identifier?: string;
    date?: string;
  };
}

export function SourceCard({ source }: SourceCardProps) {
  return (
    <div className="source-card">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm leading-tight">{source.title}</h3>
        <Button variant="outline" size="sm" asChild>
          <a href={source.officialUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3 mr-1" />
            Open
          </a>
        </Button>
      </div>
      {source.snippet && (
        <p className="text-sm text-muted-foreground line-clamp-3">{source.snippet}</p>
      )}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded bg-muted px-1.5 py-0.5">{source.jurisdiction}</span>
        <span className="rounded bg-muted px-1.5 py-0.5">{source.sourceType}</span>
        <span className="rounded bg-muted px-1.5 py-0.5">{source.authorityLevel}</span>
        {source.identifier && (
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono">{source.identifier}</span>
        )}
        {source.date && <span>{source.date}</span>}
      </div>
    </div>
  );
}
