import { Suspense } from "react";
import { TesZoekenClient } from "@/components/search/tes-zoeken-client";

export default function TesZoekenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
          Zoekresultaten laden…
        </div>
      }
    >
      <TesZoekenClient />
    </Suspense>
  );
}
