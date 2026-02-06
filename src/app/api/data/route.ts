import { NextResponse } from "next/server";
import { getRainfallData, getRiverLevelData, SYLHET_FLOOD_ZONES, HISTORICAL_FLOODS } from "@/lib/flood-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    rainfall: getRainfallData(),
    river_levels: getRiverLevelData(),
    zones: SYLHET_FLOOD_ZONES,
    historical_floods: HISTORICAL_FLOODS,
    data_source: "Simulated Real-Time (based on Sylhet historical patterns)",
    disclaimer: "This system supports early awareness and is not an official government warning.",
  });
}
