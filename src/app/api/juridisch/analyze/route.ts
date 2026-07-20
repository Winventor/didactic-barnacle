import { NextRequest, NextResponse } from "next/server";
import { caseAnalysisService } from "@/legal/services/case-analysis-service";
import { exportService } from "@/legal/services/export-service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { narrative, municipality, province, format } = body;

  if (!narrative || typeof narrative !== "string") {
    return NextResponse.json({ error: "narrative is verplicht" }, { status: 400 });
  }

  const analysis = await caseAnalysisService.analyze({
    narrative,
    municipality,
    province,
  });

  if (format === "markdown") {
    const markdown = exportService.caseAnalysisToMarkdown(analysis);
    return new NextResponse(markdown, {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  if (format === "docx") {
    const buffer = await exportService.caseAnalysisToDocx(analysis);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="casusanalyse.docx"',
      },
    });
  }

  return NextResponse.json(analysis);
}
