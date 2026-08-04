import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import "./theme.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-wk-display",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-wk-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Windkracht Vier | Klassieke open toerzeiler",
  description:
    "Technisch dossier en verkoopinformatie van Windkracht Vier — klassieke open toerzeiler uit de vroege jaren zeventig bij Giethoorn / Beulakerwijde.",
};

export default function WindkrachtVierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`windkracht-vier ${fraunces.variable} ${figtree.variable}`}
      style={{
        fontFamily: "var(--font-wk-body), Figtree, sans-serif",
      }}
    >
      <style>{`
        .windkracht-vier .wk-display {
          font-family: var(--font-wk-display), Fraunces, serif;
        }
      `}</style>
      {children}
    </div>
  );
}
