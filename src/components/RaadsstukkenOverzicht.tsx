"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  DocumentStatus,
  DocumentType,
  Municipality,
  Raadsstuk,
  SearchResult,
} from "@/lib/types";
import { DOCUMENT_TYPES } from "@/lib/types";
import { fetchMunicipalities, searchRaadsstukken } from "@/lib/ori-api";
import { Filters } from "./Filters";
import { RaadsstukkenTable } from "./RaadsstukkenTable";
import { Pagination } from "./Pagination";

const STATUS_LABELS: Record<DocumentStatus, string> = {
  aangenomen: "Aangenomen",
  verworpen: "Verworpen",
  onbekend: "Onbekend",
};

export function RaadsstukkenOverzicht() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<SearchResult | null>(null);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      type: (searchParams.get("type") ?? "alle") as DocumentType | "alle",
      status: (searchParams.get("status") ?? "alle") as DocumentStatus | "alle",
      gemeente: searchParams.get("gemeente") ?? "",
      q: searchParams.get("q") ?? "",
      page: Number(searchParams.get("page") ?? "1"),
    }),
    [searchParams]
  );

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "alle") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      if (!("page" in updates)) {
        params.delete("page");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadMunicipalities() {
      try {
        const list = await fetchMunicipalities();
        if (!cancelled) setMunicipalities(list);
      } catch {
        if (!cancelled) setMunicipalities([]);
      }
    }

    loadMunicipalities();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const json = await searchRaadsstukken({
          type: filters.type,
          status: filters.status,
          gemeente: filters.gemeente || undefined,
          zoekterm: filters.q || undefined,
          page: filters.page,
        });
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Onbekende fout");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const summary = data
    ? `${data.total.toLocaleString("nl-NL")}+ resultaten`
    : "";

  return (
    <div className="space-y-6">
      <Filters
        key={`${filters.type}-${filters.status}-${filters.gemeente}-${filters.q}`}
        type={filters.type}
        status={filters.status}
        gemeente={filters.gemeente}
        q={filters.q}
        municipalities={municipalities}
        documentTypes={DOCUMENT_TYPES}
        statusLabels={STATUS_LABELS}
        onChange={updateFilters}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
        <span>
          {loading ? "Laden…" : summary}
          {data && !loading && (
            <span className="ml-2">
              (pagina {data.page} van {data.totalPages})
            </span>
          )}
        </span>
      </div>

      <RaadsstukkenTable
        items={(data?.items ?? []) as Raadsstuk[]}
        loading={loading}
      />

      {data && data.totalPages > 1 && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onPageChange={(page) => updateFilters({ page: String(page) })}
        />
      )}
    </div>
  );
}
