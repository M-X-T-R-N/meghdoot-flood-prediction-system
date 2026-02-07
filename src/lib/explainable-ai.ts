// Explainable AI Module for Meghdoot
// Feature importance extraction and risk factor decomposition

import { type PredictionResult, type FloodZone, SYLHET_FLOOD_ZONES } from "./flood-data";

export interface FeatureContribution {
  feature: string;
  contribution: number; // percentage (0-100)
  value: string;
  impact: "positive" | "negative" | "neutral";
  description: string;
}

export interface ExplainableResult {
  zoneId: string;
  zoneName: string;
  riskScore: number;
  features: FeatureContribution[];
  topFactor: string;
  humanExplanation: string;
}

export interface GlobalFeatureImportance {
  feature: string;
  importance: number; // 0-100
  description: string;
}

// Decompose a prediction into feature contributions
export function explainPrediction(prediction: PredictionResult): ExplainableResult {
  const zone = SYLHET_FLOOD_ZONES.find(z => z.id === prediction.zone_id);
  if (!zone) {
    return {
      zoneId: prediction.zone_id,
      zoneName: prediction.zone_name,
      riskScore: prediction.risk_score,
      features: [],
      topFactor: "Unknown",
      humanExplanation: "Zone data unavailable.",
    };
  }

  // Model weights (from prediction-engine.ts scoring model)
  const dangerRatioWeight = 35;
  const rainfallIntensityWeight = 25;
  const rainfallTrendWeight = 15;
  const riverTrendWeight = 15;
  const vulnerabilityWeight = 10;

  // Estimate individual contributions proportionally to the score
  const score = prediction.risk_score;
  const total = dangerRatioWeight + rainfallIntensityWeight + rainfallTrendWeight + riverTrendWeight + vulnerabilityWeight;

  // Approximate contributions (proportional to max possible contribution)
  const dangerContrib = Math.round((dangerRatioWeight / total) * 100);
  const rainfallContrib = Math.round((rainfallIntensityWeight / total) * 100);
  const rainfallTrendContrib = Math.round((rainfallTrendWeight / total) * 100);
  const riverTrendContrib = Math.round((riverTrendWeight / total) * 100);
  const vulnContrib = Math.round((vulnerabilityWeight / total) * 100);

  const features: FeatureContribution[] = [
    {
      feature: "River Danger Ratio",
      contribution: dangerContrib,
      value: `${prediction.river_level_trend > 0 ? "Rising" : "Stable"}`,
      impact: prediction.river_level_trend > 0.1 ? "positive" : "neutral",
      description: "Current river level relative to danger threshold (35% weight)",
    },
    {
      feature: "Rainfall Intensity",
      contribution: rainfallContrib,
      value: `Trend: ${prediction.rainfall_trend > 0 ? "+" : ""}${prediction.rainfall_trend}`,
      impact: prediction.rainfall_trend > 2 ? "positive" : prediction.rainfall_trend < 0 ? "negative" : "neutral",
      description: "3-day average rainfall intensity across stations (25% weight)",
    },
    {
      feature: "Rainfall Trend",
      contribution: rainfallTrendContrib,
      value: prediction.rainfall_trend > 0 ? "Increasing" : "Decreasing",
      impact: prediction.rainfall_trend > 0 ? "positive" : "negative",
      description: "Direction and rate of rainfall change over 14 days (15% weight)",
    },
    {
      feature: "River Level Trend",
      contribution: riverTrendContrib,
      value: prediction.river_level_trend > 0 ? "Rising" : "Falling",
      impact: prediction.river_level_trend > 0 ? "positive" : "negative",
      description: "Direction and rate of river level change (15% weight)",
    },
    {
      feature: "Zone Vulnerability",
      contribution: vulnContrib,
      value: `${zone.vulnerability} (${zone.elevation_m}m)`,
      impact: zone.vulnerability === "high" ? "positive" : "neutral",
      description: "Historical vulnerability rating and elevation factor (10% weight)",
    },
  ];

  // Sort by contribution
  features.sort((a, b) => b.contribution - a.contribution);
  const topFactor = features[0].feature;

  // Human-readable explanation
  const riskFactors: string[] = [];
  if (prediction.rainfall_trend > 2) riskFactors.push("increasing rainfall");
  if (prediction.river_level_trend > 0.1) riskFactors.push("rising river levels");
  if (zone.vulnerability === "high") riskFactors.push("high zone vulnerability");
  if (zone.elevation_m < 12) riskFactors.push("low elevation");

  const humanExplanation = riskFactors.length > 0
    ? `Risk score of ${score}/100 driven primarily by ${riskFactors.join(", ")}. The dominant factor is ${topFactor.toLowerCase()}, accounting for ${features[0].contribution}% of the model weight.`
    : `Risk score of ${score}/100. No significant risk factors currently active. Zone conditions are stable.`;

  return {
    zoneId: prediction.zone_id,
    zoneName: prediction.zone_name,
    riskScore: score,
    features,
    topFactor,
    humanExplanation,
  };
}

// Global feature importance across all zones
export function getGlobalFeatureImportance(): GlobalFeatureImportance[] {
  return [
    { feature: "River Danger Ratio", importance: 35, description: "How close river levels are to danger thresholds" },
    { feature: "Rainfall Intensity", importance: 25, description: "Recent rainfall amounts relative to historical norms" },
    { feature: "Rainfall Trend", importance: 15, description: "Whether rainfall is increasing or decreasing" },
    { feature: "River Level Trend", importance: 15, description: "Direction and rate of river level changes" },
    { feature: "Zone Vulnerability", importance: 10, description: "Historical vulnerability and elevation factors" },
  ];
}
