import { SiteHeader, AUDIENCES } from "@/components/layout/site-header";
import { SearchBar } from "@/components/search/search-bar";
import type { AudienceType } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const AUDIENCE_CONTENT: Record<AudienceType, { title: string; description: string; focus: string[] }> = {
  beleidsmakers: {
    title: "Beleidsmakers",
    description: "Regionale arbeidsmarktprognoses en scenario's voor evidence-based beleid.",
    focus: ["Regionale krapte en groei", "Scenario-vergelijking", "Beleidsrelevante indicatoren", "Bronvermelding en reproduceerbaarheid"],
  },
  werkgevers: {
    title: "Werkgevers / HR",
    description: "Praktische inzichten over personeelstekorten, vacatures en retentie.",
    focus: ["Vacaturedruk en tekorten", "Sectorale trends", "Verzuim en inzetbaarheid", "Recruitment-prognoses"],
  },
  loopbaanprofessionals: {
    title: "Loopbaanprofessionals",
    description: "Loopbaan- en competentietrends voor begeleiding en advisering.",
    focus: ["Beroepstrends", "Scholingsbehoefte", "Mobiliteit tussen sectoren", "TES-competentieontwikkeling"],
  },
  onderzoekers: {
    title: "Onderzoekers",
    description: "Wetenschappelijk onderbouwde analyses met volledige explainability.",
    focus: ["Modelspecificaties", "Onzekerheidsmarges", "Databronnen en methoden", "Open onderzoeksvragen"],
  },
};

export default async function TesDoelgroepPage({ params }: PageProps) {
  const { slug } = await params;
  const audience = AUDIENCES.find((a) => a.slug === slug);
  const content = AUDIENCE_CONTENT[slug as AudienceType];

  if (!audience || !content) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold">Doelgroep niet gevonden</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Doelgroep</p>
        <h1 className="text-3xl font-semibold tracking-tight mb-3">{content.title}</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">{content.description}</p>

        <div className="rounded-xl border border-border/60 p-6 mb-10">
          <p className="text-sm font-medium mb-3">Focusgebieden</p>
          <ul className="space-y-2">
            {content.focus.map((f) => (
              <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <SearchBar audience={slug as AudienceType} size="large" />
      </main>
    </div>
  );
}

export function generateStaticParams() {
  return AUDIENCES.map((a) => ({ slug: a.slug }));
}
