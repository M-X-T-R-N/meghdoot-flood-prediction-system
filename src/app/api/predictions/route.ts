import { NextResponse } from "next/server";
import { getSystemStatus } from "@/lib/prediction-engine";
import { getServiceClient } from "@/lib/supabase";
import { calculateConfidenceInterval } from "@/lib/statistical-utils";
import { explainPrediction } from "@/lib/explainable-ai";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getSystemStatus();
  const supabase = getServiceClient();

  // Log predictions to history (only if there are severe/warning zones)
  const criticalPredictions = status.predictions.filter(
    (p) => p.risk_category === "Severe" || p.risk_category === "Warning"
  );

  if (criticalPredictions.length > 0) {
    // Check if we already logged in the last 5 minutes to avoid flooding the table
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("predictions_history")
      .select("id")
      .gte("created_at", fiveMinAgo)
      .limit(1);

    if (!recent || recent.length === 0) {
      const rows = status.predictions.map((p) => ({
        zone_id: p.zone_id,
        zone_name: p.zone_name,
        risk_score: p.risk_score,
        risk_category: p.risk_category,
        explanation: p.explanation,
        rainfall_trend: p.rainfall_trend,
        river_level_trend: p.river_level_trend,
      }));
      await supabase.from("predictions_history").insert(rows);
    }
  }

  // Add confidence intervals for risk scores
  const riskScores = status.predictions.map(p => p.risk_score);
  const riskCI = calculateConfidenceInterval(riskScores, 0.95);

  // Add feature contributions for each prediction
  const enhancedPredictions = status.predictions.map(p => ({
    ...p,
    feature_contributions: explainPrediction(p).features,
  }));

  return NextResponse.json({
    ...status,
    predictions: enhancedPredictions,
    confidence: {
      risk_mean: riskCI.mean,
      risk_lower: riskCI.lower,
      risk_upper: riskCI.upper,
      standard_error: riskCI.standardError,
      confidence_level: riskCI.confidenceLevel,
      sample_size: riskCI.sampleSize,
    },
  });
}
