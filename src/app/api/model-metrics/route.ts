import { NextResponse } from "next/server";
import { compareModels } from "@/lib/model-comparison";

export const dynamic = "force-dynamic";

export async function GET() {
  const comparison = compareModels();

  return NextResponse.json({
    ...comparison,
    computed_at: new Date().toISOString(),
  });
}
