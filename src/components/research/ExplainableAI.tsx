"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { explainPrediction, getGlobalFeatureImportance } from "@/lib/explainable-ai";
import type { PredictionResult } from "@/lib/flood-data";

const IMPACT_COLORS = { positive: "#ef4444", negative: "#22c55e", neutral: "#94a3b8" };

export default function ExplainableAI({ predictions }: { predictions: PredictionResult[] }) {
  const [selectedZone, setSelectedZone] = useState(predictions[0]?.zone_id ?? "");
  const globalImportance = useMemo(() => getGlobalFeatureImportance(), []);

  const selectedPrediction = predictions.find(p => p.zone_id === selectedZone);
  const explanation = useMemo(() => {
    if (!selectedPrediction) return null;
    return explainPrediction(selectedPrediction);
  }, [selectedPrediction]);

  const importanceData = globalImportance.map(f => ({
    feature: f.feature.replace("River Danger Ratio", "Danger Ratio").replace("Rainfall Intensity", "Rainfall Int.").replace("Zone Vulnerability", "Zone Vuln."),
    importance: f.importance,
  }));

  return (
    <div className="space-y-6">
      {/* Global Feature Importance */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h4 className="text-sm font-semibold text-slate-700">Global Feature Importance</h4>
        <p className="mb-4 text-xs text-slate-400">Weight distribution across prediction model factors</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={importanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="feature" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 40]} />
            <Tooltip />
            <Bar dataKey="importance" radius={[6, 6, 0, 0]} name="Weight (%)">
              {importanceData.map((_, i) => (
                <Cell key={i} fill={["#1a6bc4", "#0ea5c7", "#9b87f5", "#f59e0b", "#64748b"][i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Zone-Specific Explanation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-700">Zone-Specific Explanation</h4>
            <p className="text-xs text-slate-400">Understand why a zone received its risk score</p>
          </div>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {predictions.sort((a, b) => b.risk_score - a.risk_score).map((p) => (
              <option key={p.zone_id} value={p.zone_id}>{p.zone_name} (Score: {p.risk_score})</option>
            ))}
          </select>
        </div>

        {explanation && (
          <div className="space-y-4">
            {/* Human explanation */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{explanation.humanExplanation}</p>
            </div>

            {/* Feature breakdown */}
            <div className="space-y-2">
              {explanation.features.map((f) => (
                <div key={f.feature} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-700">{f.feature}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{
                        backgroundColor: `${IMPACT_COLORS[f.impact]}15`,
                        color: IMPACT_COLORS[f.impact]
                      }}>
                        {f.impact === "positive" ? "Risk Factor" : f.impact === "negative" ? "Mitigating" : "Neutral"}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">{f.description}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Value: {f.value}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-600">{f.contribution}%</div>
                    <div className="text-[10px] text-slate-400">weight</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feature Descriptions */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <h4 className="text-sm font-semibold text-blue-800">Model Transparency</h4>
        <div className="mt-2 space-y-2">
          {globalImportance.map((f) => (
            <div key={f.feature} className="flex items-center gap-2 text-xs text-blue-700">
              <span className="font-semibold">{f.feature} ({f.importance}%):</span>
              <span>{f.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
