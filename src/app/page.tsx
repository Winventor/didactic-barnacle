import { Suspense } from "react";
import { RaadsstukkenOverzicht } from "@/components/RaadsstukkenOverzicht";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-orange-700">
          Open Raadsinformatie
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">
          Moties, amendementen &amp; schriftelijke vragen
        </h1>
        <p className="mt-3 max-w-3xl text-base text-slate-600">
          Doorzoek raadsstukken uit honderden Nederlandse gemeenten. Per stuk
          ziet u de status (aangenomen of verworpen), indienende partijen,
          datum, onderwerp en een link naar het bronbestand op{" "}
          <a
            href="https://www.openraadsinformatie.nl"
            className="font-medium text-orange-700 underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            openraadsinformatie.nl
          </a>
          .
        </p>
      </header>

      <Suspense
        fallback={
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Gegevens laden…
          </div>
        }
      >
        <RaadsstukkenOverzicht />
      </Suspense>
    </main>
  );
}
