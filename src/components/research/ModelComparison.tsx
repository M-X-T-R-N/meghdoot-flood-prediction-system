"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { compareModels } from "@/lib/model-comparison";

const MODEL_COLORS = ["#1a6bc4", "#9b87f5", "#0ea5c7"];

export default function ModelComparison() {
  const result = useMemo(() => compareModels(), []);

  const accuracyData = result.models.map((m, i) => ({
    name: m.shortName,
    accuracy: m.accuracy,
    fill: MODEL_COLORS[i],
  }));

  const radarData = [
    { metric: "Accuracy", ...Object.fromEntries(result.models.map(m => [m.shortName, m.accuracy])) },
    { metric: "Precision", ...Object.fromEntries(result.models.map(m => [m.shortName, m.precision * 100])) },
    { metric: "Recall", ...Object.fromEntries(result.models.map(m => [m.shortName, m.recall * 100])) },
    { metric: "F1 Score", ...Object.fromEntries(result.models.map(m => [m.shortName, m.f1Score * 100])) },
    { metric: "R²", ...Object.fromEntries(result.models.map(m => [m.shortName, m.r2 * 100])) },
  ];

  return (
    <div className="space-y-6">
      {/* Model Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {result.models.map((model, i) => (
          <div key={model.name} className={`rounded-2xl border p-5 ${model.name === result.bestModel ? "border-blue-200 bg-blue-50/30 ring-1 ring-blue-200" : "border-slate-200 bg-white"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: MODEL_COLORS[i] }} />
              <h4 className="text-sm font-semibold text-slate-700">{model.name}</h4>
              {model.name === result.bestModel && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">BEST</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">{model.description}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold" style={{ color: MODEL_COLORS[i] }}>{model.accuracy}%</div>
                <div className="text-[10px] text-slate-400">Accuracy</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-600">{model.rmse}</div>
                <div className="text-[10px] text-slate-400">RMSE</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-600">{model.r2}</div>
                <div className="text-[10px] text-slate-400">R²</div>
              </div>
            </div>
            {/* Strengths / Weaknesses */}
            <div className="mt-3 space-y-1">
              {model.strengths.map((s) => (
                <div key={s} className="flex items-center gap-1.5 text-[10px] text-emerald-600">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />{s}
                </div>
              ))}
              {model.weaknesses.map((w) => (
                <div key={w} className="flex items-center gap-1.5 text-[10px] text-red-500">
                  <span className="h-1 w-1 rounded-full bg-red-400" />{w}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Radar Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h4 className="text-sm font-semibold text-slate-700">Multi-Metric Comparison</h4>
        <p className="mb-4 text-xs text-slate-400">Performance across key evaluation metrics</p>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
            {result.models.map((m, i) => (
              <Radar key={m.shortName} name={m.shortName} dataKey={m.shortName} stroke={MODEL_COLORS[i]} fill={MODEL_COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
            ))}
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Accuracy Bar Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h4 className="text-sm font-semibold text-slate-700">Accuracy Comparison</h4>
        <p className="mb-4 text-xs text-slate-400">Overall accuracy on {result.testEvents} historical flood events ({result.trainingYears})</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={accuracyData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="accuracy" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Confusion Matrices */}
      <div className="grid gap-4 md:grid-cols-3">
        {result.models.map((model, i) => (
          <div key={model.name} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h4 className="text-xs font-semibold text-slate-700 mb-3">{model.shortName} - Confusion Matrix</h4>
            <div className="grid grid-cols-2 gap-1 text-center text-xs">
              <div className="rounded-lg bg-emerald-50 p-3">
                <div className="text-lg font-bold text-emerald-600">{model.confusionMatrix.truePositive}</div>
                <div className="text-[10px] text-emerald-500">True Positive</div>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <div className="text-lg font-bold text-red-400">{model.confusionMatrix.falsePositive}</div>
                <div className="text-[10px] text-red-400">False Positive</div>
              </div>
              <div className="rounded-lg bg-orange-50 p-3">
                <div className="text-lg font-bold text-orange-400">{model.confusionMatrix.falseNegative}</div>
                <div className="text-[10px] text-orange-400">False Negative</div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <div className="text-lg font-bold text-emerald-600">{model.confusionMatrix.trueNegative}</div>
                <div className="text-[10px] text-emerald-500">True Negative</div>
              </div>
            </div>
            <div className="mt-2 text-center text-[10px] text-slate-400">
              F1: {model.f1Score.toFixed(2)} | Precision: {model.precision.toFixed(2)} | Recall: {model.recall.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
