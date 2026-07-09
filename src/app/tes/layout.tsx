import type { Metadata } from "next";
import "./theme.css";

export const metadata: Metadata = {
  title: "TES Labour Intelligence Platform",
  description:
    "AI-ondersteund onderzoeksinstrument voor arbeid, loopbaan, carrière, leiderschap en duurzame inzetbaarheid.",
};

export default function TesLayout({ children }: { children: React.ReactNode }) {
  return <div className="tes-platform min-h-screen">{children}</div>;
}
