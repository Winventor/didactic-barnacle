import type { Metadata } from "next";
import { LoopbaanscanClient } from "@/components/walda/loopbaanscan-client";
import { PageBanner } from "@/components/walda/page-banner";
import { WaldaHeader } from "@/components/walda/walda-header";
import { LOOPBAANSCAN_BANNER } from "@/lib/walda/loopbaanscan";

export const metadata: Metadata = {
  title: "Loopbaanscan | Walda Coaching",
  description:
    "Drielaags instrument voor loopbaanbegeleiding: quickscan, verdiepingsmodules en voortgangsmeting met profielschets en begeleidersinterventies.",
};

export default function LoopbaanscanPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <WaldaHeader />
      <PageBanner
        src={LOOPBAANSCAN_BANNER.src}
        positionX={LOOPBAANSCAN_BANNER.positionX}
        alt="Walda Coaching banner"
      />

      <main className="flex-1 mx-auto w-full max-w-4xl px-6 py-10">
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Loopbaanbegeleiding
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Loopbaanscan
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Oriënteer, verdiep en meet voortgang — van snelle profielschets tot
            gerichte interventies voor jou en je begeleider.
          </p>
        </div>

        <LoopbaanscanClient />
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
