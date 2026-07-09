import { notFound } from "next/navigation";
import { DocumentDetail } from "@/components/documents/document-detail";
import { MOCK_DOCUMENTS } from "@/lib/data/mock-generator";

export function generateStaticParams() {
  return MOCK_DOCUMENTS.map((doc) => ({ id: doc.id }));
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = MOCK_DOCUMENTS.find((d) => d.id === id);

  if (!document) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <DocumentDetail document={document} />
    </main>
  );
}
