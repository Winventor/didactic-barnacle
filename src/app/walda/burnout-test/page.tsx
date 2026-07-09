import type { Metadata } from "next";
import { BurnoutTestClient } from "@/components/walda/burnout-test-client";
import { PageBanner } from "@/components/walda/page-banner";
import { WaldaHeader } from "@/components/walda/walda-header";
import { BURNOUT_TEST_BANNER } from "@/lib/walda/burnout-test";

export const metadata: Metadata = {
  title: "Burnout test | Walda Coaching",
  description:
    "Klik de stressklachten aan die op jou van toepassing zijn en ontvang een persoonlijke indicatie op basis van mentale, fysieke, gedrags- en emotionele symptomen.",
};

export default function BurnoutTestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <WaldaHeader />
      <PageBanner
        src={BURNOUT_TEST_BANNER.src}
        positionX={BURNOUT_TEST_BANNER.positionX}
        alt="Walda Coaching banner"
      />

      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-10">
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Klachten &amp; symptomen bij stress
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Burnout test
          </h1>
        </div>

        <BurnoutTestClient />
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
