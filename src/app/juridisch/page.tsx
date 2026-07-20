import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  FileText,
  Gavel,
  Scale,
  PenTool,
  Database,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    href: "/juridisch/definities",
    title: "Definitie zoeken",
    description: "Zoek juridische begrippen met wettelijke en jurisprudentiële betekenis",
    icon: BookOpen,
  },
  {
    href: "/juridisch/casus",
    title: "Analyseer mijn casus",
    description: "Feitenextractie, issue tree, bronnen en proceskansindicatie",
    icon: FileText,
  },
  {
    href: "/juridisch/jurisprudentie",
    title: "Jurisprudentie zoeken",
    description: "NL, EU en EHRM-rechtspraak via officiële bronnen",
    icon: Gavel,
  },
  {
    href: "/juridisch/wetgeving",
    title: "Wetgeving zoeken",
    description: "Nationale, lokale en EU-wetgeving via Wetten.overheid.nl en EUR-Lex",
    icon: Scale,
  },
  {
    href: "/juridisch/claim",
    title: "Claim genereren",
    description: "Concept sommatie, dagvaarding, bezwaar, aangifteonderbouwing en meer",
    icon: PenTool,
  },
  {
    href: "/juridisch/bronnen",
    title: "Bronstatus",
    description: "Status van alle aangesloten officiële databronnen",
    icon: Database,
  },
];

export default function JuridischDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Juridisch Onderzoeksplatform</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Onderzoeks-, analyse- en claimplatform voor Nederlands recht en Europees recht dat in
          Nederland van toepassing is. Uitsluitend officiële en openbaar toegankelijke bronnen.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-[hsl(var(--legal-primary))]" />
                  <CardTitle className="text-lg">{title}</CardTitle>
                </div>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary flex items-center gap-1">
                  Openen <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Drie bewijslabels</CardTitle>
          <CardDescription>Elke juridische bewering wordt geclassificeerd</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="label-bron mr-2">BRON</span>
            Rechtstreeks uit wetgeving, verdrag, beleidsregel of uitspraak
          </p>
          <p>
            <span className="label-afgeleid mr-2">AFGELEIDE RECHTSREGEL</span>
            Door het systeem uit meerdere bronnen afgeleide regel
          </p>
          <p>
            <span className="label-toepassing mr-2">TOEPASSING OP DE CASUS</span>
            Juridische analyse van de feiten van de gebruiker
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
