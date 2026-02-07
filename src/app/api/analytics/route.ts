import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { runClimateProjection } from "@/lib/climate-simulator";
import { calculateConfidenceInterval } from "@/lib/statistical-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = getServiceClient();
  const { searchParams } = new URL(req.url);
  const yearFrom = parseInt(searchParams.get("from") || "1974");
  const yearTo = parseInt(searchParams.get("to") || "2025");
  const climateScenario = searchParams.get("climate"); // "optimistic" | "moderate" | "pessimistic"

  const [yearlyRes, monthlyRes, historicalRes] = await Promise.all([
    supabase
      .from("yearly_stats")
      .select("*")
      .gte("year", yearFrom)
      .lte("year", yearTo)
      .order("year", { ascending: true }),
    supabase
      .from("monthly_rainfall")
      .select("*")
      .gte("year", yearFrom)
      .lte("year", yearTo)
      .order("year", { ascending: true }),
    supabase
      .from("historical_floods")
      .select("*")
      .gte("year", yearFrom)
      .lte("year", yearTo)
      .order("year", { ascending: false }),
  ]);

  // Compute analytics summaries
  const yearly = yearlyRes.data || [];
  const monthly = monthlyRes.data || [];
  const historical = historicalRes.data || [];

  // Decade analysis
  const decades: Record<string, { years: number[]; totalRainfall: number; totalAffected: number; totalDeaths: number; severeCount: number; floodEvents: number }> = {};
  for (const y of yearly) {
    const decade = `${Math.floor(y.year / 10) * 10}s`;
    if (!decades[decade]) decades[decade] = { years: [], totalRainfall: 0, totalAffected: 0, totalDeaths: 0, severeCount: 0, floodEvents: 0 };
    decades[decade].years.push(y.year);
    decades[decade].totalRainfall += y.annual_rainfall_mm || 0;
    decades[decade].totalAffected += y.total_affected || 0;
    decades[decade].totalDeaths += y.total_deaths || 0;
    decades[decade].floodEvents += y.flood_events || 0;
    if (y.max_severity === "Severe") decades[decade].severeCount++;
  }
  const decadeAnalysis = Object.entries(decades).map(([decade, d]) => ({
    decade,
    avg_rainfall: Math.round(d.totalRainfall / d.years.length),
    total_affected: d.totalAffected,
    total_deaths: d.totalDeaths,
    severe_floods: d.severeCount,
    total_flood_events: d.floodEvents,
    years_covered: d.years.length,
  }));

  // Trend analysis
  const recentYears = yearly.filter(y => y.year >= 2014);
  const olderYears = yearly.filter(y => y.year < 2014 && y.year >= 2004);
  const recentAvgRainfall = recentYears.length > 0 ? Math.round(recentYears.reduce((s, y) => s + (y.annual_rainfall_mm || 0), 0) / recentYears.length) : 0;
  const olderAvgRainfall = olderYears.length > 0 ? Math.round(olderYears.reduce((s, y) => s + (y.annual_rainfall_mm || 0), 0) / olderYears.length) : 0;
  const recentAvgAffected = recentYears.length > 0 ? Math.round(recentYears.reduce((s, y) => s + (y.total_affected || 0), 0) / recentYears.length) : 0;
  const olderAvgAffected = olderYears.length > 0 ? Math.round(olderYears.reduce((s, y) => s + (y.total_affected || 0), 0) / olderYears.length) : 0;

  // Confidence intervals on rainfall data
  const rainfallValues = yearly.map(y => y.annual_rainfall_mm || 0).filter(v => v > 0);
  const rainfallCI = calculateConfidenceInterval(rainfallValues, 0.95);

  // Climate projection overlay (optional)
  let climateProjection = null;
  if (climateScenario) {
    const scenarios: Record<string, { rainfall: number; extreme: number; year: number }> = {
      optimistic: { rainfall: 5, extreme: 1.2, year: 2035 },
      moderate: { rainfall: 12, extreme: 1.5, year: 2040 },
      pessimistic: { rainfall: 25, extreme: 2.2, year: 2050 },
    };
    const s = scenarios[climateScenario];
    if (s) {
      climateProjection = runClimateProjection({
        rainfallIncreasePct: s.rainfall,
        extremeEventMultiplier: s.extreme,
        projectionYear: s.year,
      });
    }
  }

  return NextResponse.json({
    yearly_stats: yearly,
    monthly_rainfall: monthly,
    historical_floods: historical,
    decade_analysis: decadeAnalysis,
    trend: {
      recent_avg_rainfall: recentAvgRainfall,
      older_avg_rainfall: olderAvgRainfall,
      rainfall_change_pct: olderAvgRainfall > 0 ? Math.round(((recentAvgRainfall - olderAvgRainfall) / olderAvgRainfall) * 100) : 0,
      recent_avg_affected: recentAvgAffected,
      older_avg_affected: olderAvgAffected,
      affected_change_pct: olderAvgAffected > 0 ? Math.round(((recentAvgAffected - olderAvgAffected) / olderAvgAffected) * 100) : 0,
    },
    confidence: {
      rainfall_mean: rainfallCI.mean,
      rainfall_lower: rainfallCI.lower,
      rainfall_upper: rainfallCI.upper,
      standard_error: rainfallCI.standardError,
    },
    climate_projection: climateProjection,
    range: { from: yearFrom, to: yearTo },
    total_records: yearly.length,
  });
}
