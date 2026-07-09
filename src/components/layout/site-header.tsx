import Link from "next/link";
import { cn } from "@/lib/utils";

const AUDIENCES = [
  { slug: "beleidsmakers", label: "Beleidsmakers", description: "Beleidsrelevante prognoses en scenario's" },
  { slug: "werkgevers", label: "Werkgevers / HR", description: "Praktische arbeidsmarktinzichten" },
  { slug: "loopbaanprofessionals", label: "Loopbaanprofessionals", description: "Loopbaan- en competentietrends" },
  { slug: "onderzoekers", label: "Onderzoekers", description: "Wetenschappelijk onderbouwde analyses" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background text-sm font-semibold">
            TES
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-tight">Labour Intelligence</p>
            <p className="text-xs text-muted-foreground">Evidence-first onderzoeksplatform</p>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {AUDIENCES.map((a) => (
            <Link
              key={a.slug}
              href={`/doelgroep/${a.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {a.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function AudienceCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {AUDIENCES.map((a) => (
        <Link
          key={a.slug}
          href={`/doelgroep/${a.slug}`}
          className="group rounded-xl border border-border/60 p-5 hover:border-foreground/20 hover:shadow-sm transition-all"
        >
          <p className="text-sm font-medium group-hover:text-foreground">{a.label}</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{a.description}</p>
        </Link>
      ))}
    </div>
  );
}

export { AUDIENCES };
