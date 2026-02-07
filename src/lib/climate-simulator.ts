// Climate Simulator Engine for Meghdoot
// Projects flood risk under various climate change scenarios

import { HISTORICAL_FLOODS, ANNUAL_RAINFALL, MONTHLY_RAINFALL_DATA } from "./flood-data";

export interface ClimateScenario {
  rainfallIncreasePct: number;    // 0-30% increase
  extremeEventMultiplier: number; // 1.0-3.0x
  projectionYear: number;         // 2025-2050
}

export interface ClimateProjection {
  scenario: ClimateScenario;
  baselineRisk: number;
  projectedRisk: number;
  riskEscalationPct: number;
  projectedAnnualRainfall: number;
  projectedFloodFrequency: number;
  baselineFloodFrequency: number;
  monthlyProjections: { month: string; baseline: number; projected: number }[];
  extremeEventProbability: number;
  seaLevelImpact: number;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Average baseline metrics from historical data
function getBaselineMetrics() {
  const years = Object.keys(ANNUAL_RAINFALL).map(Number);
  const avgRainfall = Object.values(ANNUAL_RAINFALL).reduce((a, b) => a + b, 0) / years.length;

  // Average flood frequency per year from historical floods
  const floodYears = new Set(HISTORICAL_FLOODS.map(f => f.year));
  const floodsPerYear = HISTORICAL_FLOODS.length / (Math.max(...years) - Math.min(...years) + 1);

  // Average monthly rainfall across all years
  const monthlyAvg = MONTH_NAMES.map((_, i) => {
    const vals = Object.values(MONTHLY_RAINFALL_DATA).map(months => months[i]);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });

  // Baseline risk: normalized from historical severe events
  const severeEvents = HISTORICAL_FLOODS.filter(f => f.severity === "Severe").length;
  const baselineRisk = (severeEvents / HISTORICAL_FLOODS.length) * 100;

  return { avgRainfall, floodsPerYear, monthlyAvg, baselineRisk, floodYears };
}

export function runClimateProjection(scenario: ClimateScenario): ClimateProjection {
  const baseline = getBaselineMetrics();
  const { rainfallIncreasePct, extremeEventMultiplier, projectionYear } = scenario;

  // Year factor: risk compounds over time (roughly 0.5% per year from 2025)
  const yearDelta = Math.max(0, projectionYear - 2025);
  const yearFactor = 1 + yearDelta * 0.005;

  // Projected annual rainfall
  const rainfallMultiplier = 1 + rainfallIncreasePct / 100;
  const projectedAnnualRainfall = Math.round(baseline.avgRainfall * rainfallMultiplier * yearFactor);

  // Projected flood frequency
  const baselineFloodFrequency = baseline.floodsPerYear;
  const projectedFloodFrequency = baselineFloodFrequency * rainfallMultiplier * extremeEventMultiplier * yearFactor;

  // Risk escalation
  const projectedRisk = Math.min(100, baseline.baselineRisk * rainfallMultiplier * extremeEventMultiplier * yearFactor);
  const riskEscalationPct = baseline.baselineRisk > 0
    ? Math.round(((projectedRisk - baseline.baselineRisk) / baseline.baselineRisk) * 100)
    : 0;

  // Monthly projections - monsoon months amplified more
  const monthlyProjections = baseline.monthlyAvg.map((baseVal, i) => {
    const isMonsoon = i >= 4 && i <= 8;
    const monthMultiplier = isMonsoon
      ? rainfallMultiplier * (1 + (extremeEventMultiplier - 1) * 0.3)
      : rainfallMultiplier;
    return {
      month: MONTH_NAMES[i],
      baseline: Math.round(baseVal),
      projected: Math.round(baseVal * monthMultiplier * yearFactor),
    };
  });

  // Extreme event probability (base ~5% per monsoon month, scales with multiplier)
  const extremeEventProbability = Math.min(0.95, 0.05 * extremeEventMultiplier * rainfallMultiplier * yearFactor);

  // Sea level impact (mm) - simplified projection
  const seaLevelImpact = Math.round(yearDelta * 3.2 * (rainfallIncreasePct / 10 + 1));

  return {
    scenario,
    baselineRisk: Math.round(baseline.baselineRisk * 10) / 10,
    projectedRisk: Math.round(projectedRisk * 10) / 10,
    riskEscalationPct,
    projectedAnnualRainfall,
    projectedFloodFrequency: Math.round(projectedFloodFrequency * 10) / 10,
    baselineFloodFrequency: Math.round(baselineFloodFrequency * 10) / 10,
    monthlyProjections,
    extremeEventProbability: Math.round(extremeEventProbability * 1000) / 1000,
    seaLevelImpact,
  };
}

// Predefined scenarios for quick access
export const PRESET_SCENARIOS: { name: string; description: string; scenario: ClimateScenario }[] = [
  {
    name: "Optimistic (RCP 2.6)",
    description: "Strong emission cuts, limited warming",
    scenario: { rainfallIncreasePct: 5, extremeEventMultiplier: 1.2, projectionYear: 2035 },
  },
  {
    name: "Moderate (RCP 4.5)",
    description: "Some mitigation, moderate warming",
    scenario: { rainfallIncreasePct: 12, extremeEventMultiplier: 1.5, projectionYear: 2040 },
  },
  {
    name: "Pessimistic (RCP 8.5)",
    description: "Business as usual, severe warming",
    scenario: { rainfallIncreasePct: 25, extremeEventMultiplier: 2.2, projectionYear: 2050 },
  },
];
