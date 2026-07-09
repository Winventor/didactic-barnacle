"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Calendar,
  Building2,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import type { PolicyDocument } from "@/types/policy-document";

interface DocumentDetailProps {
  document: PolicyDocument;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (!value || value === "—" || value === "") return null;
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-4 py-2">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm sm:col-span-2">{value}</dd>
    </div>
  );
}

export function DocumentDetail({ document: doc }: DocumentDetailProps) {
  const fragments = doc.content
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 20)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Terug naar overzicht
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge>{doc.policyLayer}</Badge>
          <Badge variant="outline">{doc.documentType}</Badge>
          <Badge variant="secondary">{doc.status}</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {doc.title}
        </h1>
        <p className="text-muted-foreground leading-relaxed">{doc.summary}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href={doc.sourceUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            OpenRaadsinformatie
          </a>
        </Button>
        {doc.pdfUrl && (
          <Button variant="outline" asChild>
            <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="mr-2 h-4 w-4" />
              PDF downloaden
            </a>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            Documentgegevens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <DetailRow label="Beleidslaag" value={doc.policyLayer} />
            <DetailRow label="Documentsoort" value={doc.documentType} />
            <DetailRow label="Organisatie" value={doc.organisation} />
            <DetailRow label="Bestuurslaag" value={doc.governmentLevel} />
            <DetailRow label="Provincie" value={doc.province} />
            <DetailRow label="Gemeente" value={doc.municipality} />
            <DetailRow label="Waterschap" value={doc.waterAuthority} />
            <DetailRow
              label="Datum document"
              value={formatDate(doc.documentDate)}
            />
            <DetailRow
              label="Datum vergadering"
              value={formatDate(doc.meetingDate)}
            />
            <DetailRow label="Portefeuillehouder" value={doc.portfolioHolder} />
            <DetailRow label="Indiener" value={doc.submitter} />
            <DetailRow label="Vergadering" value={doc.meeting} />
            <DetailRow label="Agendapunt" value={doc.agendaItem} />
            <DetailRow label="Dossier" value={doc.dossier} />
            <DetailRow label="Status" value={doc.status} />
            <DetailRow label="Besluit" value={doc.decision} />
            <DetailRow label="Stemuitslag" value={doc.votingResult} />
          </dl>
        </CardContent>
      </Card>

      {doc.keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="h-5 w-5" />
              Zoekwoorden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {doc.keywords.map((kw) => (
                <Badge key={kw} variant="outline">
                  {kw}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {fragments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Relevante tekstfragmenten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fragments.map((fragment, i) => (
              <blockquote
                key={i}
                className="border-l-4 border-primary/30 pl-4 text-sm italic text-muted-foreground"
              >
                {fragment}
              </blockquote>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <DetailRow label="Thema" value={doc.theme} />
            <DetailRow label="Politieke partij" value={doc.politicalParty} />
            <DetailRow
              label="Laatst bijgewerkt"
              value={formatDate(doc.updatedAt)}
            />
            <DetailRow
              label="Document URL"
              value={
                <a
                  href={doc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {doc.documentUrl}
                </a>
              }
            />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
