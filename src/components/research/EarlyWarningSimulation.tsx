"use client";

import { useState } from "react";
import type { PredictionResult } from "@/lib/flood-data";

const RISK_COLORS: Record<string, string> = {
  Normal: "#22c55e",
  Watch: "#eab308",
  Warning: "#f97316",
  Severe: "#ef4444",
};

const EVACUATION_STAGES = [
  { level: "Normal", stage: "No Action Required", color: "#22c55e", actions: ["Monitor local news", "Ensure emergency kit is prepared"] },
  { level: "Watch", stage: "Awareness", color: "#eab308", actions: ["Stay alert to flood bulletins", "Review evacuation routes", "Secure valuables above flood level"] },
  { level: "Warning", stage: "Preparation", color: "#f97316", actions: ["Prepare to evacuate", "Move livestock to higher ground", "Stock food and water for 72 hours", "Charge phones and pack documents"] },
  { level: "Severe", stage: "Evacuate Now", color: "#ef4444", actions: ["Move to designated shelter immediately", "Do not attempt to cross flooded areas", "Call emergency services if stranded", "Help elderly and disabled neighbors"] },
];

export default function EarlyWarningSimulation({ predictions }: { predictions: PredictionResult[] }) {
  const [selectedZone, setSelectedZone] = useState(predictions[0]?.zone_id ?? "");
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedPrediction = predictions.find(p => p.zone_id === selectedZone);
  const riskCategory = selectedPrediction?.risk_category ?? "Normal";
  const currentStage = EVACUATION_STAGES.find(s => s.level === riskCategory) ?? EVACUATION_STAGES[0];

  const smsPreview = selectedPrediction ? {
    en: `[Meghdoot Alert] Flood risk ${riskCategory.toUpperCase()} in ${selectedPrediction.zone_name}. Risk score: ${selectedPrediction.risk_score}/100. ${riskCategory === "Severe" ? "EVACUATE to nearest shelter immediately." : riskCategory === "Warning" ? "Prepare to evacuate. Move valuables to higher ground." : riskCategory === "Watch" ? "Stay alert. Monitor water levels." : "No action needed."} Stay safe. This is not an official government warning.`,
    bn: `[মেঘদূত সতর্কতা] ${selectedPrediction.zone_name} এলাকায় বন্যার ঝুঁকি ${riskCategory === "Severe" ? "অত্যন্ত বেশি" : riskCategory === "Warning" ? "বেশি" : riskCategory === "Watch" ? "মাঝারি" : "স্বাভাবিক"}। ঝুঁকির মাত্রা: ${selectedPrediction.risk_score}/১০০। ${riskCategory === "Severe" ? "এখনই নিকটস্থ আশ্রয়কেন্দ্রে যান।" : riskCategory === "Warning" ? "সরে যাওয়ার প্রস্তুতি নিন।" : "সতর্ক থাকুন।"} নিরাপদ থাকুন।`,
  } : null;

  return (
    <div className="space-y-6">
      {/* Zone Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          {predictions.sort((a, b) => b.risk_score - a.risk_score).map((p) => (
            <option key={p.zone_id} value={p.zone_id}>{p.zone_name} - {p.risk_category} ({p.risk_score})</option>
          ))}
        </select>
        <button
          onClick={() => { setIsSimulating(true); setTimeout(() => setIsSimulating(false), 2000); }}
          className="rounded-xl meghdoot-gradient px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg"
        >
          {isSimulating ? "Simulating..." : "Simulate Alert"}
        </button>
      </div>

      {/* Evacuation Stage Indicator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">Evacuation Stage Indicator</h4>
        <div className="flex items-center gap-1 mb-6">
          {EVACUATION_STAGES.map((stage, i) => (
            <div key={stage.level} className="flex-1 relative">
              <div className={`h-2 rounded-full ${i === 0 ? "rounded-l-full" : ""} ${i === 3 ? "rounded-r-full" : ""}`}
                style={{ backgroundColor: stage.level === riskCategory ? stage.color : `${stage.color}25` }} />
              <div className={`mt-2 text-center text-[10px] ${stage.level === riskCategory ? "font-bold" : "text-slate-400"}`}
                style={{ color: stage.level === riskCategory ? stage.color : undefined }}>
                {stage.stage}
              </div>
            </div>
          ))}
        </div>

        {/* Current Stage Details */}
        <div className="rounded-xl p-4" style={{ backgroundColor: `${currentStage.color}08`, borderColor: `${currentStage.color}25`, borderWidth: 1 }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: currentStage.color }} />
            <span className="text-sm font-semibold" style={{ color: currentStage.color }}>{currentStage.stage}</span>
            <span className="text-xs text-slate-400">- {riskCategory} level</span>
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-slate-600">Required Actions:</div>
            {currentStage.actions.map((action, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                <svg className="h-3.5 w-3.5 flex-shrink-0" style={{ color: currentStage.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
                {action}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SMS Preview */}
      {smsPreview && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
              <h4 className="text-xs font-semibold text-slate-700">SMS Preview (English)</h4>
            </div>
            <div className={`rounded-xl p-4 text-xs leading-relaxed ${isSimulating ? "animate-pulse" : ""}`}
              style={{ backgroundColor: `${RISK_COLORS[riskCategory]}08`, color: RISK_COLORS[riskCategory] }}>
              {smsPreview.en}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
              <h4 className="text-xs font-semibold text-slate-700">SMS Preview (Bengali)</h4>
            </div>
            <div className={`rounded-xl p-4 text-xs leading-relaxed ${isSimulating ? "animate-pulse" : ""}`}
              style={{ backgroundColor: `${RISK_COLORS[riskCategory]}08`, color: RISK_COLORS[riskCategory] }}>
              {smsPreview.bn}
            </div>
          </div>
        </div>
      )}

      {/* Preparedness Checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">Emergency Preparedness Checklist</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { item: "Emergency contact numbers saved", category: "Communication" },
            { item: "Battery-powered radio available", category: "Communication" },
            { item: "3-day water supply (4L per person/day)", category: "Supplies" },
            { item: "Non-perishable food for 72 hours", category: "Supplies" },
            { item: "First aid kit and medications", category: "Health" },
            { item: "Important documents in waterproof bag", category: "Documents" },
            { item: "Evacuation route identified", category: "Plan" },
            { item: "Nearest shelter location known", category: "Plan" },
          ].map((item) => (
            <div key={item.item} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <div className="text-xs text-slate-700">{item.item}</div>
                <div className="text-[10px] text-slate-400">{item.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
