"use client";

import { POLICY_LAYER_TABS } from "@/lib/constants/document-types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { PolicyLayerTab, PolicyDocument } from "@/types/policy-document";

interface PolicyTabsProps {
  activeTab: PolicyLayerTab | "alle";
  onTabChange: (tab: PolicyLayerTab | "alle") => void;
  documents: PolicyDocument[];
}

export function PolicyTabs({
  activeTab,
  onTabChange,
  documents,
}: PolicyTabsProps) {
  const counts = {
    alle: documents.length,
    Beleidsvorming: documents.filter((d) => d.policyLayer === "Beleidsvorming")
      .length,
    Besluitvorming: documents.filter((d) => d.policyLayer === "Besluitvorming")
      .length,
    "Uitvoering & Evaluatie": documents.filter(
      (d) => d.policyLayer === "Uitvoering & Evaluatie",
    ).length,
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as PolicyLayerTab | "alle")}
    >
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
        <TabsTrigger value="alle" className="gap-2 py-2">
          Alle
          <Badge variant="secondary" className="text-xs">
            {counts.alle}
          </Badge>
        </TabsTrigger>
        {POLICY_LAYER_TABS.map((tab) => (
          <TabsTrigger key={tab} value={tab} className="gap-2 py-2 text-xs sm:text-sm">
            <span className="truncate">{tab}</span>
            <Badge variant="secondary" className="text-xs">
              {counts[tab]}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
