"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { FilterBar } from "@/components/filters/filter-bar";
import { PolicyTabs } from "@/components/documents/policy-tabs";
import { DocumentsTable } from "@/components/documents/documents-table";
import { usePolicyDocuments } from "@/hooks/use-policy-documents";
import { useDocumentFilters } from "@/hooks/use-document-filters";
import {
  computeDashboardStats,
  documentsPerYear,
  countByField,
} from "@/lib/stats/compute-stats";

export function Dashboard() {
  const { data: documents, isLoading, error } = usePolicyDocuments();
  const {
    filters,
    updateFilter,
    resetFilters,
    activeTab,
    setActiveTab,
    filteredDocuments,
    activeFilterCount,
  } = useDocumentFilters(documents);

  // Sync header search with filter search
  const handleHeaderSearch = (value: string) => {
    updateFilter("search", value);
  };

  const stats = useMemo(
    () => computeDashboardStats(filteredDocuments),
    [filteredDocuments],
  );

  const chartData = useMemo(
    () => ({
      perYear: documentsPerYear(filteredDocuments),
      perGovernmentLevel: countByField(
        filteredDocuments,
        "governmentLevel",
        8,
      ),
      perOrganisation: countByField(filteredDocuments, "organisation", 8),
      perPolicyLayer: countByField(filteredDocuments, "policyLayer", 5),
      perTheme: countByField(filteredDocuments, "theme", 8),
    }),
    [filteredDocuments],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h2 className="text-lg font-semibold text-destructive">
          Fout bij laden
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          De documenten konden niet worden geladen. Probeer de pagina te
          vernieuwen.
        </p>
      </div>
    );
  }

  return (
    <>
      <Header
        search={filters.search}
        onSearchChange={handleHeaderSearch}
        documents={filteredDocuments}
      />

      <FilterBar
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        documents={documents ?? []}
        activeFilterCount={activeFilterCount}
      />

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6">
        <StatsCards stats={stats} />
        <DashboardCharts {...chartData} />

        <section className="space-y-4">
          <PolicyTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            documents={
              documents?.filter((d) => {
                const base = true;
                if (filters.policyLayer && d.policyLayer !== filters.policyLayer)
                  return false;
                return base;
              }) ?? []
            }
          />
          <DocumentsTable documents={filteredDocuments} />
        </section>
      </main>
    </>
  );
}
