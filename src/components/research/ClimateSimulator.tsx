"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { runClimateProjection, PRESET_SCENARIOS, type ClimateScenario } from "@/lib/climate-simulator";
import { RiskGauge } from "@/components/ui/risk-gauge";

export default function ClimateSimulator() {
  const [rainfallPct, setRainfallPct] = useState(12);
  const [extremeMultiplier, setExtremeMultiplier] = useState(1.5);
  const [year, setYear] = useState(2040);

  const scenario: ClimateScenario = { rainfallIncreasePct: rainfallPct, extremeEventMultiplier: extremeMultiplier, projectionYear: year };
  const projection = useMemo(() => runClimateProjection(scenario), [rainfallPct, extremeMultiplier, year]);

  const applyPreset = (s: ClimateScenario) => {
    setRainfallPct(s.rainfallIncreasePct);
    setExtremeMultiplier(s.extremeEventMultiplier);
    setYear(s.projectionYear);
  };

  return (
    <div className="space-y-6">
      {/* Preset Scenarios */}
      <div className="flex flex-wrap gap-2">
        {PRESET_SCENARIOS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p.scenario)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            <div className="font-semibold">{p.name}</div>
            <div className="text-[10px] text-slate-400">{p.description}</div>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">Scenario Parameters</h4>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>Rainfall Increase</span>
              <span className="font-bold text-blue-600">+{rainfallPct}%</span>
            </label>
            <input type="range" min={0} max={30} value={rainfallPct} onChange={(e) => setRainfallPct(Number(e.target.value))} className="w-full accent-blue-600" />
            <div className="mt-1 flex justify-between text-[10px] text-slate-400"><span>0%</span><span>30%</span></div>
          </div>
          <div>
            <label className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>Extreme Event Multiplier</span>
              <span className="font-bold text-orange-600">{extremeMultiplier.toFixed(1)}x</span>
            </label>
            <input type="range" min={10} max={30} value={extremeMultiplier * 10} onChange={(e) => setExtremeMultiplier(Number(e.target.value) / 10)} className="w-full accent-orange-500" />
            <div className="mt-1 flex justify-between text-[10px] text-slate-400"><span>1.0x</span><span>3.0x</span></div>
          </div>
          <div>
            <label className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>Projection Year</span>
              <span className="font-bold text-purple-600">{year}</span>
            </label>
            <input type="range" min={2025} max={2050} value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full accent-purple-500" />
            <div className="mt-1 flex justify-between text-[10px] text-slate-400"><span>2025</span><span>2050</span></div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
          <RiskGauge value={Math.round(projection.projectedRisk)} size={100} label="Projected Risk" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs text-slate-500">Risk Escalation</div>
          <div className="mt-1 text-2xl font-bold text-red-500">+{projection.riskEscalationPct}%</div>
          <div className="mt-1 text-[10px] text-slate-400">vs. baseline ({projection.baselineRisk}%)</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs text-slate-500">Projected Rainfall</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{projection.projectedAnnualRainfall.toLocaleString()}</div>
          <div className="mt-1 text-[10px] text-slate-400">mm/year</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-xs text-slate-500">Extreme Event Prob.</div>
          <div className="mt-1 text-2xl font-bold text-orange-500">{(projection.extremeEventProbability * 100).toFixed(1)}%</div>
          <div className="mt-1 text-[10px] text-slate-400">per monsoon month</div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h4 className="text-sm font-semibold text-slate-700">Monthly Rainfall: Baseline vs Projected</h4>
        <p className="mb-4 text-xs text-slate-400">Comparing historical average with {year} climate scenario</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={projection.monthlyProjections}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Baseline" />
            <Bar dataKey="projected" fill="#1a6bc4" radius={[4, 4, 0, 0]} name={`Projected (${year})`} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional info */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <h4 className="text-sm font-semibold text-blue-800">Projection Notes</h4>
        <p className="mt-1 text-xs text-blue-700 leading-relaxed">
          Flood frequency projected to increase from {projection.baselineFloodFrequency} to {projection.projectedFloodFrequency} events/year.
          Sea level contribution: +{projection.seaLevelImpact}mm by {year}. Monsoon months (May-Sep) show amplified impact due to
          compound effects of increased rainfall and extreme event frequency.
        </p>
      </div>
    </div>
  );
}
