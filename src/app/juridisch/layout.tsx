import type { Metadata } from "next";
import { JuridischHeader } from "@/components/juridisch/juridisch-header";
import { LegalDisclaimer } from "@/components/juridisch/claim-label-badge";
import "./theme.css";

export const metadata: Metadata = {
  title: "Juridisch Onderzoeksplatform",
  description:
    "Juridisch onderzoek naar Nederlands recht en Europees recht met officiële bronnen",
};

export default function JuridischLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="juridisch-theme min-h-screen bg-background">
      <JuridischHeader />
      <main className="container mx-auto max-w-5xl px-4 py-8 space-y-7">
        {children}
        <LegalDisclaimer />
      </main>
    </div>
  );
}
