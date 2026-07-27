import Link from "next/link";

export function WaldaHeader() {
  return (
    <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
        <Link href="https://waldacoaching.nl" className="group">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Walda Coaching
          </p>
          <p className="text-sm font-semibold group-hover:text-primary transition-colors">
            Voor wie verder wil
          </p>
        </Link>
        <nav className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href="/walda/loopbaanscan"
            className="hover:text-foreground transition-colors"
          >
            Loopbaanscan
          </Link>
          <Link
            href="/walda/depressietest"
            className="hover:text-foreground transition-colors"
          >
            Depressietest
          </Link>
          <Link
            href="/walda/burnout-test"
            className="hover:text-foreground transition-colors"
          >
            Burnout test
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <a
            href="tel:0528522142"
            className="hidden sm:inline text-muted-foreground hover:text-foreground transition-colors"
          >
            0528 – 522 142
          </a>
          <a
            href="https://waldacoaching.nl/contact/"
            className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Maak afspraak
          </a>
        </div>
      </div>
    </header>
  );
}
