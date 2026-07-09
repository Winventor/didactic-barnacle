import { MOCK_DOCUMENTS } from "@/lib/data/mock-generator";
import type { DataProvider } from "@/lib/data/types";
import type { PolicyDocument } from "@/types/policy-document";

/**
 * Mock data provider for local development.
 * Future: ApiDataProvider, ScraperDataProvider, SupabaseDataProvider
 */
export class MockDataProvider implements DataProvider {
  private documents: PolicyDocument[];

  constructor(documents: PolicyDocument[] = MOCK_DOCUMENTS) {
    this.documents = documents;
  }

  async getDocuments(): Promise<PolicyDocument[]> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 150));
    return [...this.documents];
  }

  async getDocumentById(id: string): Promise<PolicyDocument | null> {
    await new Promise((r) => setTimeout(r, 50));
    return this.documents.find((d) => d.id === id) ?? null;
  }
}

/** Singleton provider — replace here when connecting to real data source */
export const dataProvider: DataProvider = new MockDataProvider();
