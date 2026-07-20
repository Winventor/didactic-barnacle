import { NextRequest, NextResponse } from "next/server";
import { definitionService } from "@/legal/services/definition-service";

export async function GET(request: NextRequest) {
  const term = request.nextUrl.searchParams.get("term") ?? "";
  if (!term) {
    return NextResponse.json({ error: "Parameter term is verplicht" }, { status: 400 });
  }

  const result = await definitionService.search(term);
  return NextResponse.json(result);
}
