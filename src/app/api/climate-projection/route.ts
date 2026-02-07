import { NextRequest, NextResponse } from "next/server";
import { runClimateProjection, type ClimateScenario } from "@/lib/climate-simulator";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rainfallIncreasePct = parseFloat(searchParams.get("rainfall") || "12");
  const extremeEventMultiplier = parseFloat(searchParams.get("extreme") || "1.5");
  const projectionYear = parseInt(searchParams.get("year") || "2040");

  const scenario: ClimateScenario = {
    rainfallIncreasePct: Math.max(0, Math.min(30, rainfallIncreasePct)),
    extremeEventMultiplier: Math.max(1, Math.min(3, extremeEventMultiplier)),
    projectionYear: Math.max(2025, Math.min(2050, projectionYear)),
  };

  const projection = runClimateProjection(scenario);

  return NextResponse.json({
    projection,
    computed_at: new Date().toISOString(),
  });
}
