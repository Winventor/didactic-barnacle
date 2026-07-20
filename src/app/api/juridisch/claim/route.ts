import { NextRequest, NextResponse } from "next/server";
import { claimGeneratorService } from "@/legal/services/claim-generator-service";
import { exportService } from "@/legal/services/export-service";
import type { ClaimDocumentType } from "@/legal/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { narrative, documentType, tone, desiredOutcome, municipality, format } = body;

  if (!narrative) {
    return NextResponse.json({ error: "narrative is verplicht" }, { status: 400 });
  }

  const claim = await claimGeneratorService.generate(
    { narrative, municipality },
    {
      documentType: (documentType ?? "JURIDISCHE_NOTITIE") as ClaimDocumentType,
      tone: tone ?? "FORMEEL",
      desiredOutcome: desiredOutcome ?? "Juridische actie",
    }
  );

  if (format === "markdown") {
    return new NextResponse(exportService.claimToMarkdown(claim), {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  if (format === "docx") {
    const buffer = await exportService.claimToDocx(claim);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="concept-claim.docx"',
      },
    });
  }

  return NextResponse.json(claim);
}
