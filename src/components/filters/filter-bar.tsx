"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GOVERNMENT_LEVELS } from "@/lib/constants/government-levels";
import { POLICY_LAYER_TABS } from "@/lib/constants/document-types";
import { THEMES } from "@/lib/constants/themes";
import { STATUSES, PORTFOLIO_HOLDERS } from "@/lib/constants/organisations";
import { getUniqueValues } from "@/lib/filters/apply-filters";
import type { DocumentFilters, PolicyDocument } from "@/types/policy-document";

interface FilterBarProps {
  filters: DocumentFilters;
  updateFilter: <K extends keyof DocumentFilters>(
    key: K,
    value: DocumentFilters[K],
  ) => void;
  resetFilters: () => void;
  documents: PolicyDocument[];
  activeFilterCount: number;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Alle",
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select
        value={value || "__all__"}
        onValueChange={(v) => onChange(v === "__all__" ? "" : v)}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function FilterBar({
  filters,
  updateFilter,
  resetFilters,
  documents,
  activeFilterCount,
}: FilterBarProps) {
  const organisations = getUniqueValues(documents, "organisation");
  const provinces = getUniqueValues(documents, "province");
  const municipalities = getUniqueValues(documents, "municipality");
  const waterAuthorities = getUniqueValues(documents, "waterAuthority");
  const documentTypes = getUniqueValues(documents, "documentType");

  return (
    <div className="sticky top-[57px] z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-7 gap-1 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs text-muted-foreground">Vrij zoeken</Label>
            <Input
              className="h-8 text-xs"
              placeholder="Zoek in alle velden…"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>

          <FilterSelect
            label="Beleidslaag"
            value={filters.policyLayer}
            options={[...POLICY_LAYER_TABS]}
            onChange={(v) => updateFilter("policyLayer", v)}
          />

          <FilterSelect
            label="Documentsoort"
            value={filters.documentType}
            options={documentTypes}
            onChange={(v) => updateFilter("documentType", v)}
          />

          <FilterSelect
            label="Bestuurslaag"
            value={filters.governmentLevel}
            options={[...GOVERNMENT_LEVELS]}
            onChange={(v) => updateFilter("governmentLevel", v)}
          />

          <FilterSelect
            label="Organisatie"
            value={filters.organisation}
            options={organisations}
            onChange={(v) => updateFilter("organisation", v)}
          />

          <FilterSelect
            label="Provincie"
            value={filters.province}
            options={provinces}
            onChange={(v) => updateFilter("province", v)}
          />

          <FilterSelect
            label="Gemeente"
            value={filters.municipality}
            options={municipalities}
            onChange={(v) => updateFilter("municipality", v)}
          />

          <FilterSelect
            label="Waterschap"
            value={filters.waterAuthority}
            options={waterAuthorities}
            onChange={(v) => updateFilter("waterAuthority", v)}
          />

          <FilterSelect
            label="Thema"
            value={filters.theme}
            options={[...THEMES]}
            onChange={(v) => updateFilter("theme", v)}
          />

          <FilterSelect
            label="Status"
            value={filters.status}
            options={[...STATUSES]}
            onChange={(v) => updateFilter("status", v)}
          />

          <FilterSelect
            label="Portefeuillehouder"
            value={filters.portfolioHolder}
            options={[...PORTFOLIO_HOLDERS]}
            onChange={(v) => updateFilter("portfolioHolder", v)}
          />

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Periode van</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={filters.dateFrom}
              onChange={(e) => updateFilter("dateFrom", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Periode tot</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={filters.dateTo}
              onChange={(e) => updateFilter("dateTo", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
