import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raadsinformatie Overzicht",
  description:
    "Overzicht van moties, amendementen en schriftelijke vragen uit de Open Raadsinformatie API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
