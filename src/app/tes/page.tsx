import { SiteHeader, AudienceCards } from "@/components/layout/site-header";
import { SearchBar } from "@/components/search/search-bar";

export default function TesHomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-full max-w-3xl text-center mb-12">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
            TES Labour Intelligence Platform
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-4">
            Inzicht in arbeid,<br />
            <span className="text-muted-foreground">wetenschappelijk onderbouwd</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
            Statistische modellen doen de voorspelling. AI legt uit. TES interpreteert de betekenis.
          </p>
        </div>

        <div className="w-full max-w-3xl">
          <SearchBar size="large" />
        </div>

        <div className="w-full max-w-5xl mt-20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 text-center">
            Kies uw perspectief
          </p>
          <AudienceCards />
        </div>
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        TES Labour Intelligence Platform v1.0 — Evidence-first · Explainable-first · Scientific-first
      </footer>
    </div>
  );
}
