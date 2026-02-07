"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";

const FloodMap = dynamic(() => import("@/components/FloodMap"), { ssr: false });
const ClimateSimulator = dynamic(() => import("@/components/research/ClimateSimulator"));
const VulnerabilityIndex = dynamic(() => import("@/components/research/VulnerabilityIndex"));
const ModelComparison = dynamic(() => import("@/components/research/ModelComparison"));
const ConfidenceBand = dynamic(() => import("@/components/research/ConfidenceBand"));
const ExplainableAI = dynamic(() => import("@/components/research/ExplainableAI"));
const EarlyWarningSimulation = dynamic(() => import("@/components/research/EarlyWarningSimulation"));

// Types
interface Prediction {
  zone_id: string;
  zone_name: string;
  risk_score: number;
  risk_category: "Normal" | "Watch" | "Warning" | "Severe";
  explanation: string;
  rainfall_trend: number;
  river_level_trend: number;
  timestamp: string;
}

interface Summary {
  max_risk: number;
  avg_risk: number;
  severe_zones: number;
  warning_zones: number;
  watch_zones: number;
  normal_zones: number;
  total_zones: number;
  last_updated: string;
  data_source: string;
}

interface FloodZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius_km: number;
  elevation_m: number;
  vulnerability: string;
  population: number;
}

interface RainfallRecord {
  date: string;
  rainfall_mm: number;
  station: string;
}

interface RiverLevelRecord {
  date: string;
  river: string;
  level_m: number;
  danger_level_m: number;
  station: string;
}

interface SMSLogEntry {
  id: string;
  timestamp: string;
  zone: string;
  risk_category: string;
  message_en: string;
  message_bn: string;
  recipients: number;
  status: string;
}

interface SubscriberEntry {
  id: string;
  name: string;
  phone: string;
  area: string;
  language: string;
  active: boolean;
  created_at: string;
}

interface ValidationEvent {
  event: string;
  predicted: boolean;
  lead_time_hours: number;
  actual_severity: string;
  predicted_severity: string;
}

interface ValidationData {
  events: ValidationEvent[];
  accuracy_percent: number;
  detected: number;
  missed: number;
  total: number;
  avg_lead_time_hours: number;
}

type TabKey = "map" | "charts" | "alerts" | "subscribers" | "validation" | "climate" | "vulnerability" | "models" | "confidence" | "explainability" | "warning-sim";

const RISK_COLORS: Record<string, string> = {
  Normal: "#22c55e",
  Watch: "#eab308",
  Warning: "#f97316",
  Severe: "#ef4444",
};

const TABS: { key: TabKey; label: string; icon: string; group?: string }[] = [
  { key: "map", label: "Flood Map", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
  { key: "charts", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { key: "alerts", label: "SMS Alerts", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { key: "subscribers", label: "Subscribers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "validation", label: "Validation", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { key: "climate", label: "Climate Sim", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z", group: "research" },
  { key: "vulnerability", label: "Vulnerability", icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z", group: "research" },
  { key: "models", label: "Model Compare", icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5", group: "research" },
  { key: "confidence", label: "Confidence", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z", group: "research" },
  { key: "explainability", label: "Explainable AI", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z", group: "research" },
  { key: "warning-sim", label: "Alert Sim", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0", group: "research" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("map");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [zones, setZones] = useState<FloodZone[]>([]);
  const [rainfall, setRainfall] = useState<RainfallRecord[]>([]);
  const [riverLevels, setRiverLevels] = useState<RiverLevelRecord[]>([]);
  const [smsLog, setSmsLog] = useState<SMSLogEntry[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberEntry[]>([]);
  const [validation, setValidation] = useState<ValidationData | null>(null);
  const [alertThreshold, setAlertThreshold] = useState(50);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [predRes, dataRes] = await Promise.all([
        fetch("/api/predictions"),
        fetch("/api/data"),
      ]);
      const predJson = await predRes.json();
      const dataJson = await dataRes.json();

      setPredictions(predJson.predictions);
      setSummary(predJson.summary);
      setZones(dataJson.zones);
      setRainfall(dataJson.rainfall);
      setRiverLevels(dataJson.river_levels);
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === "validation" && !validation) {
      fetch("/api/validation")
        .then((r) => r.json())
        .then(setValidation);
    }
    if (activeTab === "alerts") {
      fetch("/api/alerts")
        .then((r) => r.json())
        .then((d) => setSmsLog(d.sms_log || []));
    }
    if (activeTab === "subscribers") {
      fetch("/api/subscribe")
        .then((r) => r.json())
        .then((d) => setSubscribers(d.subscribers || []));
    }
  }, [activeTab, validation]);

  const sendAlerts = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold: alertThreshold }),
      });
      const data = await res.json();
      setSmsLog(data.sms_log || []);
    } finally {
      setSending(false);
    }
  };

  // Prepare chart data
  const rainfallChartData = (() => {
    const byDate: Record<string, Record<string, number>> = {};
    rainfall.slice(-60).forEach((r) => {
      if (!byDate[r.date]) byDate[r.date] = {};
      byDate[r.date][r.station] = (byDate[r.date][r.station] || 0) + r.rainfall_mm;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, stations]) => ({
        date: date.slice(5),
        ...stations,
        total: Object.values(stations).reduce((a, b) => a + b, 0),
      }));
  })();

  const riverChartData = (() => {
    const byDate: Record<string, Record<string, number>> = {};
    const dangers: Record<string, number> = {};
    riverLevels.slice(-60).forEach((r) => {
      const key = `${r.river} (${r.station})`;
      if (!byDate[r.date]) byDate[r.date] = {};
      byDate[r.date][key] = r.level_m;
      dangers[key] = r.danger_level_m;
    });
    return {
      data: Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-30)
        .map(([date, levels]) => ({ date: date.slice(5), ...levels })),
      dangers,
    };
  })();

  const riskBarData = predictions
    .sort((a, b) => b.risk_score - a.risk_score)
    .map((p) => ({
      name: p.zone_name,
      score: p.risk_score,
      fill: RISK_COLORS[p.risk_category],
    }));

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center animated-gradient-bg">
        <div className="text-center glass-card rounded-3xl p-12">
          <Image src="/logo.png" alt="Meghdoot" width={64} height={64} className="mx-auto mb-4 animate-float" />
          <div className="mb-2 text-2xl font-bold meghdoot-gradient-text">Meghdoot Admin</div>
          <div className="text-slate-500">Loading flood prediction system...</div>
          <div className="mt-4 h-1.5 w-48 mx-auto overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full meghdoot-gradient shimmer" style={{ width: "80%" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-60" : "w-16"} flex flex-col border-r border-white/40 bg-white/70 backdrop-blur-xl transition-all duration-300`}>
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-slate-100/50 px-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center gap-3 text-left group">
              <Image src="/logo.png" alt="Meghdoot" width={36} height={36} className="rounded-xl transition-transform duration-300 group-hover:scale-110" />
              {sidebarOpen && (
                <div>
                  <div className="text-lg font-bold meghdoot-gradient-text leading-tight">Meghdoot</div>
                  <div className="text-[10px] text-slate-400 font-medium tracking-wide">Research Dashboard</div>
                </div>
              )}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {TABS.map((tab, i) => (
              <div key={tab.key}>
                {tab.group === "research" && (i === 0 || TABS[i - 1]?.group !== "research") && sidebarOpen && (
                  <div className="mb-2 mt-4 px-3 text-[9px] font-bold uppercase tracking-widest text-blue-400/70">Research Lab</div>
                )}
                {tab.group === "research" && (i === 0 || TABS[i - 1]?.group !== "research") && !sidebarOpen && (
                  <div className="my-3 mx-auto h-px w-8 bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                )}
                <button
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? "meghdoot-gradient text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                      : "text-slate-500 hover:bg-white/80 hover:text-slate-700 hover:shadow-sm"
                  }`}
                >
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  {sidebarOpen && <span className="truncate">{tab.label}</span>}
                </button>
              </div>
            ))}
          </nav>

          {/* Data source badge */}
          {sidebarOpen && (
            <div className="border-t border-slate-100/50 p-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 p-3 border border-blue-100/50">
                <div className="text-xs font-semibold text-slate-700">Simulated Real-Time</div>
                <div className="mt-0.5 text-[10px] text-slate-500">Based on Sylhet historical patterns</div>
              </div>
              <a href="/" className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-400 hover:bg-white/60 hover:text-slate-600 transition-all duration-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Landing Page
              </a>
            </div>
          )}
        </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/40 bg-white/60 px-6 backdrop-blur-xl">
            <div>
              <h1 className="text-base font-semibold text-slate-800 tracking-tight">
                {TABS.find((t) => t.key === activeTab)?.label}
              </h1>
              <p className="text-xs text-slate-400">
                Sylhet Division, Bangladesh
              </p>
            </div>
            <div className="flex items-center gap-3">
              {summary && (
                <div className="flex items-center gap-2 text-xs">
                  <StatusPill label="Severe" count={summary.severe_zones} color="red" />
                  <StatusPill label="Warning" count={summary.warning_zones} color="orange" />
                  <StatusPill label="Watch" count={summary.watch_zones} color="yellow" />
                  <StatusPill label="Normal" count={summary.normal_zones} color="green" />
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Updated: {summary ? new Date(summary.last_updated).toLocaleTimeString() : "--"}
              </div>
            </div>
          </header>

        <div className="p-6">
          {/* Map Tab */}
          {activeTab === "map" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <SummaryCard label="Max Risk Score" value={summary?.max_risk ?? 0} suffix="/100" color={getRiskColor(summary?.max_risk ?? 0)} />
                <SummaryCard label="Avg Risk Score" value={summary?.avg_risk ?? 0} suffix="/100" color={getRiskColor(summary?.avg_risk ?? 0)} />
                <SummaryCard label="Zones at Risk" value={(summary?.severe_zones ?? 0) + (summary?.warning_zones ?? 0)} suffix={`/${summary?.total_zones ?? 0}`} color="#f97316" />
                <SummaryCard label="Population at Risk" value={getPopulationAtRisk(predictions, zones)} suffix="" color="#ef4444" />
              </div>
              <div className="h-[500px]">
                <FloodMap predictions={predictions} zones={zones} />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="text-sm font-semibold text-slate-700">Zone Risk Overview</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                      <tr>
                        <th className="px-5 py-3 text-left font-medium">Zone</th>
                        <th className="px-5 py-3 text-left font-medium">Risk Score</th>
                        <th className="px-5 py-3 text-left font-medium">Category</th>
                        <th className="px-5 py-3 text-left font-medium">Vulnerability</th>
                        <th className="px-5 py-3 text-left font-medium">Explanation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {predictions.sort((a, b) => b.risk_score - a.risk_score).map((p) => {
                        const zone = zones.find((z) => z.id === p.zone_id);
                        return (
                          <tr key={p.zone_id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-700">{p.zone_name}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                                  <div className="h-full rounded-full transition-all" style={{ width: `${p.risk_score}%`, backgroundColor: RISK_COLORS[p.risk_category] }} />
                                </div>
                                <span className="text-xs font-medium text-slate-600">{p.risk_score}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: `${RISK_COLORS[p.risk_category]}15`, color: RISK_COLORS[p.risk_category] }}>
                                {p.risk_category}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs text-slate-500 capitalize">{zone?.vulnerability ?? "--"}</td>
                            <td className="max-w-xs px-5 py-3 text-xs text-slate-500 truncate">{p.explanation}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Charts Tab */}
          {activeTab === "charts" && (
            <div className="space-y-6">
              <ChartCard title="Flood Risk by Zone" subtitle="Current risk scores (0-100)">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Rainfall (Last 30 Days)" subtitle="Daily rainfall by station (mm)">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={rainfallChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="Sylhet" stackId="1" stroke="#1a6bc4" fill="#1a6bc480" />
                    <Area type="monotone" dataKey="Sunamganj" stackId="1" stroke="#9b87f5" fill="#9b87f580" />
                    <Area type="monotone" dataKey="Companiganj" stackId="1" stroke="#0ea5c7" fill="#0ea5c780" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="River Water Levels (Last 30 Days)" subtitle="Water level vs danger level (meters)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={riverChartData.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    {Object.entries(riverChartData.dangers).map(([key, danger], i) => (
                      <ReferenceLine key={`danger-${key}`} y={danger} stroke={["#ef4444", "#f97316", "#eab308"][i]} strokeDasharray="5 5" label={{ value: `Danger: ${key}`, fontSize: 9, fill: "#94a3b8" }} />
                    ))}
                    <Line type="monotone" dataKey="Surma (Sylhet (Kanairghat))" stroke="#1a6bc4" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Kushiyara (Sherpur)" stroke="#9b87f5" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Surma (Sunamganj)" stroke="#0ea5c7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {/* SMS Alerts Tab */}
          {activeTab === "alerts" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-700">Send SMS Alerts</h3>
                <div className="flex flex-wrap items-end gap-6">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Risk Score Threshold</label>
                    <input type="range" min={10} max={90} value={alertThreshold} onChange={(e) => setAlertThreshold(Number(e.target.value))} className="w-52 accent-blue-600" />
                    <div className="mt-1 text-xs text-slate-600">
                      Trigger when risk &ge; <span className="font-bold text-blue-700">{alertThreshold}</span>
                    </div>
                  </div>
                  <button onClick={sendAlerts} disabled={sending} className="rounded-xl meghdoot-gradient px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg disabled:opacity-50">
                    {sending ? "Sending..." : "Send SMS Alerts Now"}
                  </button>
                  <div className="text-xs text-slate-400">
                    {predictions.filter((p) => p.risk_score >= alertThreshold).length} zones would receive alerts
                  </div>
                </div>

                {/* Alert preview */}
                <div className="mt-5 space-y-2">
                  <div className="text-xs font-medium text-slate-500">Preview (Bengali SMS):</div>
                  {predictions.filter((p) => p.risk_score >= alertThreshold).sort((a, b) => b.risk_score - a.risk_score).map((p) => (
                    <div key={p.zone_id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: RISK_COLORS[p.risk_category] }} />
                        <span className="font-semibold text-slate-700">{p.zone_name}</span>
                        <span className="text-slate-400">Score: {p.risk_score}</span>
                      </div>
                      <div className="text-slate-600 font-bengali">
                        [মেঘদূত সতর্কতা] {p.zone_name} এলাকায় বন্যার ঝুঁকি {p.risk_category === "Severe" ? "অত্যন্ত বেশি" : "বেশি"}। পরবর্তী ১২ ঘণ্টায় পানি বাড়তে পারে। নিরাপদ স্থানে যান।
                      </div>
                    </div>
                  ))}
                  {predictions.filter((p) => p.risk_score >= alertThreshold).length === 0 && (
                    <div className="text-xs text-slate-400">No zones currently above threshold.</div>
                  )}
                </div>
              </div>

              {/* SMS Log */}
              <div className="glass-card rounded-2xl">
                <div className="border-b border-slate-100/50 px-5 py-4">
                  <h3 className="text-sm font-semibold text-slate-700">SMS Log History</h3>
                </div>
                {smsLog.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    No SMS alerts sent yet. Use the controls above to send alerts.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500">
                        <tr>
                          <th className="px-5 py-3 text-left font-medium">Time</th>
                          <th className="px-5 py-3 text-left font-medium">Zone</th>
                          <th className="px-5 py-3 text-left font-medium">Risk</th>
                          <th className="px-5 py-3 text-left font-medium">Recipients</th>
                          <th className="px-5 py-3 text-left font-medium">Status</th>
                          <th className="px-5 py-3 text-left font-medium">Message (BN)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {smsLog.slice().reverse().map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-5 py-3 font-medium text-slate-700">{log.zone}</td>
                            <td className="px-5 py-3">
                              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: `${RISK_COLORS[log.risk_category] || "#94a3b8"}15`, color: RISK_COLORS[log.risk_category] || "#94a3b8" }}>
                                {log.risk_category}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs text-slate-600">{log.recipients?.toLocaleString()}</td>
                            <td className="px-5 py-3">
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {log.status}
                              </span>
                            </td>
                            <td className="max-w-xs truncate px-5 py-3 text-xs text-slate-500">{log.message_bn || log.message_en}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscribers Tab */}
          {activeTab === "subscribers" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <SummaryCard label="Total Subscribers" value={subscribers.length} suffix="" color="#1a6bc4" />
                <SummaryCard label="Active" value={subscribers.filter(s => s.active).length} suffix="" color="#22c55e" />
                <SummaryCard label="Bengali Pref" value={subscribers.filter(s => s.language === "bn").length} suffix="" color="#9b87f5" />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="text-sm font-semibold text-slate-700">Registered Subscribers</h3>
                  <p className="text-xs text-slate-400">People who signed up for SMS flood alerts</p>
                </div>
                {subscribers.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    No subscribers yet. Share the landing page to get registrations.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500">
                        <tr>
                          <th className="px-5 py-3 text-left font-medium">Name</th>
                          <th className="px-5 py-3 text-left font-medium">Phone</th>
                          <th className="px-5 py-3 text-left font-medium">Area</th>
                          <th className="px-5 py-3 text-left font-medium">Language</th>
                          <th className="px-5 py-3 text-left font-medium">Status</th>
                          <th className="px-5 py-3 text-left font-medium">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {subscribers.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-700">{sub.name}</td>
                            <td className="px-5 py-3 text-xs text-slate-600">{sub.phone}</td>
                            <td className="px-5 py-3 text-xs text-slate-600">{sub.area}</td>
                            <td className="px-5 py-3 text-xs text-slate-600">{sub.language === "bn" ? "Bengali" : "English"}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium ${sub.active ? "text-emerald-600" : "text-slate-400"}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${sub.active ? "bg-emerald-500" : "bg-slate-300"}`} />
                                {sub.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs text-slate-500">{new Date(sub.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Validation Tab */}
          {activeTab === "validation" && validation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <SummaryCard label="Detection Accuracy" value={validation.accuracy_percent} suffix="%" color="#22c55e" />
                <SummaryCard label="Events Detected" value={validation.detected} suffix={`/${validation.total}`} color="#1a6bc4" />
                <SummaryCard label="Events Missed" value={validation.missed} suffix={`/${validation.total}`} color="#ef4444" />
                <SummaryCard label="Avg Lead Time" value={validation.avg_lead_time_hours} suffix=" hrs" color="#9b87f5" />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="text-sm font-semibold text-slate-700">Historical Flood Event Validation</h3>
                  <p className="text-xs text-slate-400">Comparing model predictions with actual Sylhet flood events (2017-2024)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500">
                      <tr>
                        <th className="px-5 py-3 text-left font-medium">Event</th>
                        <th className="px-5 py-3 text-left font-medium">Detected</th>
                        <th className="px-5 py-3 text-left font-medium">Lead Time</th>
                        <th className="px-5 py-3 text-left font-medium">Actual</th>
                        <th className="px-5 py-3 text-left font-medium">Predicted</th>
                        <th className="px-5 py-3 text-left font-medium">Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validation.events.map((ev) => (
                        <tr key={ev.event} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 font-medium text-slate-700">{ev.event}</td>
                          <td className="px-5 py-3">{ev.predicted ? <span className="text-emerald-600 font-medium">Yes</span> : <span className="text-red-500 font-medium">No</span>}</td>
                          <td className="px-5 py-3 text-xs text-slate-600">{ev.predicted ? `${ev.lead_time_hours}h` : "--"}</td>
                          <td className="px-5 py-3"><span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: `${RISK_COLORS[ev.actual_severity] || "#94a3b8"}15`, color: RISK_COLORS[ev.actual_severity] || "#94a3b8" }}>{ev.actual_severity}</span></td>
                          <td className="px-5 py-3"><span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: `${RISK_COLORS[ev.predicted_severity] || "#94a3b8"}15`, color: RISK_COLORS[ev.predicted_severity] || "#94a3b8" }}>{ev.predicted_severity}</span></td>
                          <td className="px-5 py-3">{ev.actual_severity === ev.predicted_severity ? <span className="text-xs font-medium text-emerald-600">Exact</span> : ev.predicted ? <span className="text-xs font-medium text-amber-500">Partial</span> : <span className="text-xs font-medium text-red-500">Missed</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-2xl meghdoot-gradient-soft border border-blue-100 p-5">
                <h4 className="text-sm font-semibold text-blue-800">Research Notes</h4>
                <p className="mt-1.5 text-xs text-blue-700 leading-relaxed">
                  The model uses a weighted linear combination of 5 factors: river danger ratio (35%), rainfall intensity (25%),
                  rainfall trend (15%), river level trend (15%), and zone vulnerability (10%). Validation against 8 historical flood
                  events from 2017-2024 shows {validation.accuracy_percent}% detection rate with an average lead time of {validation.avg_lead_time_hours} hours.
                </p>
              </div>
            </div>
          )}
            {/* Climate Simulator Tab */}
            {activeTab === "climate" && <ClimateSimulator />}

            {/* Vulnerability Index Tab */}
            {activeTab === "vulnerability" && <VulnerabilityIndex predictions={predictions} />}

            {/* Model Comparison Tab */}
            {activeTab === "models" && <ModelComparison />}

            {/* Confidence Band Tab */}
            {activeTab === "confidence" && <ConfidenceBand rainfall={rainfall} />}

            {/* Explainable AI Tab */}
            {activeTab === "explainability" && <ExplainableAI predictions={predictions} />}

            {/* Early Warning Simulation Tab */}
            {activeTab === "warning-sim" && <EarlyWarningSimulation predictions={predictions} />}
          </div>

          <footer className="border-t border-slate-100 bg-white p-4 text-center text-[10px] text-slate-400">
            This system supports early awareness and is not an official government warning. | Meghdoot - Flood Prediction System for Sylhet, Bangladesh
          </footer>
      </main>
    </div>
  );
}

// --- Utility Components ---

function StatusPill({ label, count, color }: { label: string; count: number; color: string }) {
  const colorMap: Record<string, string> = {
    red: "bg-red-50 text-red-700 border-red-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium ${colorMap[color]}`}>
      {count} {label}
    </span>
  );
}

function SummaryCard({ label, value, suffix, color }: { label: string; value: number | string; suffix: string; color: string }) {
    return (
      <div className="group rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-5 transition-all duration-300 hover:bg-white/90 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5">
        <div className="text-xs text-slate-500 font-medium">{label}</div>
        <div className="mt-1.5 flex items-baseline gap-0.5">
          <span className="text-2xl font-bold tabular-nums animate-count-up" style={{ color }}>{typeof value === "number" ? value.toLocaleString() : value}</span>
          <span className="text-xs text-slate-400">{suffix}</span>
        </div>
      </div>
    );
  }

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-white/80 hover:shadow-lg hover:shadow-slate-200/30">
      <h3 className="text-sm font-semibold text-slate-700 tracking-tight">{title}</h3>
      <p className="mb-4 text-xs text-slate-400">{subtitle}</p>
      {children}
    </div>
  );
}

function getRiskColor(score: number): string {
  if (score >= 75) return "#ef4444";
  if (score >= 50) return "#f97316";
  if (score >= 30) return "#eab308";
  return "#22c55e";
}

function getPopulationAtRisk(predictions: Prediction[], zones: FloodZone[]): string {
  const atRisk = predictions
    .filter((p) => p.risk_score >= 30)
    .reduce((sum, p) => {
      const zone = zones.find((z) => z.id === p.zone_id);
      return sum + (zone?.population ?? 0);
    }, 0);
  if (atRisk >= 1000000) return `${(atRisk / 1000000).toFixed(1)}M`;
  if (atRisk >= 1000) return `${(atRisk / 1000).toFixed(0)}K`;
  return String(atRisk);
}
