import type { Metadata } from "next";
import { DepressietestClient } from "@/components/walda/depressietest-client";
import { PageBanner } from "@/components/walda/page-banner";
import { WaldaHeader } from "@/components/walda/walda-header";
import { DEPRESSIETEST_BANNER } from "@/lib/walda/depressietest";

export const metadata: Metadata = {
  title: "Depressietest | Walda Coaching",
  description:
    "Vragenlijst en interpretatie — beantwoord 7 vragen over je stemming en ontvang persoonlijk advies per scorebereik.",
};

export default function DepressietestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <WaldaHeader />
      <PageBanner
        src={DEPRESSIETEST_BANNER.src}
        positionX={DEPRESSIETEST_BANNER.positionX}
        alt="Walda Coaching banner"
      />

      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-10">
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Vragenlijst en interpretatie
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Depressietest
          </h1>
        </div>

        <DepressietestClient />
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        <p>Walda Coaching — Professionele Coaching Praktijk</p>
        <p className="mt-1">
          <a
            href="https://waldacoaching.nl"
            className="hover:text-foreground transition-colors"
          >
            waldacoaching.nl
          </a>
          {" · "}
          <a
            href="tel:0528522142"
            className="hover:text-foreground transition-colors"
          >
            0528 – 522 142
          </a>
        </p>
      </footer>
    </div>
  );
}
