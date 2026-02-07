"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { generateUncertaintyBands, calculateConfidenceInterval } from "@/lib/statistical-utils";
import type { RainfallRecord } from "@/lib/flood-data";

export default function ConfidenceBand({ rainfall }: { rainfall: RainfallRecord[] }) {
  const { bandData, ci } = useMemo(() => {
    // Aggregate daily rainfall across all stations
    const byDate: Record<string, number> = {};
    rainfall.forEach((r) => {
      byDate[r.date] = (byDate[r.date] || 0) + r.rainfall_mm;
    });

    const timeSeries = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, value]) => ({ date: date.slice(5), value }));

    const bandData = generateUncertaintyBands(timeSeries, 7);
    const values = timeSeries.map(d => d.value);
    const ci = calculateConfidenceInterval(values);

    return { bandData, ci };
  }, [rainfall]);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Mean Daily Rainfall</div>
          <div className="mt-1 text-xl font-bold text-blue-600">{ci.mean.toFixed(1)} mm</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">95% CI Range</div>
          <div className="mt-1 text-xl font-bold text-slate-700">{ci.lower.toFixed(1)} - {ci.upper.toFixed(1)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Standard Error</div>
          <div className="mt-1 text-xl font-bold text-purple-600">{ci.standardError.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">Variance</div>
          <div className="mt-1 text-xl font-bold text-orange-500">{ci.variance.toFixed(1)}</div>
        </div>
      </div>

      {/* Chart with confidence bands */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h4 className="text-sm font-semibold text-slate-700">Rainfall with Confidence Bands</h4>
        <p className="mb-4 text-xs text-slate-400">Rolling 7-day window with 80% and 95% confidence intervals</p>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={bandData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
                    <div className="font-semibold text-slate-700 mb-1">{label}</div>
                    <div>Actual: <span className="font-bold text-blue-600">{d.value.toFixed(1)} mm</span></div>
                    <div className="text-slate-500">95% CI: {d.lower95.toFixed(1)} - {d.upper95.toFixed(1)}</div>
                    <div className="text-slate-500">80% CI: {d.lower80.toFixed(1)} - {d.upper80.toFixed(1)}</div>
                  </div>
                );
              }}
            />
            {/* 95% band */}
            <Area type="monotone" dataKey="upper95" stroke="none" fill="#1a6bc4" fillOpacity={0.08} stackId="none" />
            <Area type="monotone" dataKey="lower95" stroke="none" fill="#ffffff" fillOpacity={0.8} stackId="none" />
            {/* 80% band */}
            <Area type="monotone" dataKey="upper80" stroke="none" fill="#1a6bc4" fillOpacity={0.15} stackId="none" />
            <Area type="monotone" dataKey="lower80" stroke="none" fill="#ffffff" fillOpacity={0.8} stackId="none" />
            {/* Actual values */}
            <Area type="monotone" dataKey="value" stroke="#1a6bc4" fill="#1a6bc4" fillOpacity={0.2} strokeWidth={2} name="Rainfall (mm)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5"><div className="h-2 w-4 rounded bg-blue-500/20" /> Actual</div>
          <div className="flex items-center gap-1.5"><div className="h-2 w-4 rounded bg-blue-500/15" /> 80% CI</div>
          <div className="flex items-center gap-1.5"><div className="h-2 w-4 rounded bg-blue-500/8" /> 95% CI</div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
        <h4 className="text-sm font-semibold text-blue-800">Statistical Interpretation</h4>
        <p className="mt-1 text-xs text-blue-700 leading-relaxed">
          Based on {ci.sampleSize} daily observations, the mean aggregated rainfall is {ci.mean.toFixed(1)}mm (SE: {ci.standardError.toFixed(2)}).
          We are 95% confident the true daily mean lies between {ci.lower.toFixed(1)}mm and {ci.upper.toFixed(1)}mm.
          Variance of {ci.variance.toFixed(1)} indicates {ci.variance > 500 ? "high" : ci.variance > 200 ? "moderate" : "low"} day-to-day variability.
        </p>
      </div>
    </div>
  );
}
