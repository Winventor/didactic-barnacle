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
      <main className="container mx-auto px-4 py-6 space-y-6">
        {children}
        <LegalDisclaimer />
      </main>
    </div>
  );
}
