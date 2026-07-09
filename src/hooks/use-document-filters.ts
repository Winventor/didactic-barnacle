"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DEFAULT_FILTERS,
  type DocumentFilters,
  type PolicyLayerTab,
} from "@/types/policy-document";
import { applyFilters } from "@/lib/filters/apply-filters";
import type { PolicyDocument } from "@/types/policy-document";

export function useDocumentFilters(documents: PolicyDocument[] | undefined) {
  const [filters, setFilters] = useState<DocumentFilters>(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState<PolicyLayerTab | "alle">("alle");

  const updateFilter = useCallback(
    <K extends keyof DocumentFilters>(key: K, value: DocumentFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setActiveTab("alle");
  }, []);

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    let result = applyFilters(documents, filters);
    if (activeTab !== "alle") {
      result = result.filter((d) => d.policyLayer === activeTab);
    }
    return result;
  }, [documents, filters, activeTab]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) => key !== "search" && value !== "",
    ).length;
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    activeTab,
    setActiveTab,
    filteredDocuments,
    activeFilterCount,
  };
}
