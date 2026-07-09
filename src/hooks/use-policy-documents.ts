"use client";

import { useQuery } from "@tanstack/react-query";
import { dataProvider } from "@/lib/data/provider";

export const POLICY_DOCUMENTS_KEY = ["policy-documents"] as const;

export function usePolicyDocuments() {
  return useQuery({
    queryKey: POLICY_DOCUMENTS_KEY,
    queryFn: () => dataProvider.getDocuments(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePolicyDocument(id: string) {
  return useQuery({
    queryKey: [...POLICY_DOCUMENTS_KEY, id],
    queryFn: () => dataProvider.getDocumentById(id),
    staleTime: 5 * 60 * 1000,
  });
}
