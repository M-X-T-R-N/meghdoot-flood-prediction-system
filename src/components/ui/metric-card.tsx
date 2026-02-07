"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  color?: string;
  icon?: React.ReactNode;
  trend?: { direction: "up" | "down" | "neutral"; value: string };
  className?: string;
}

export function MetricCard({ label, value, suffix = "", color = "#1a6bc4", icon, trend, className }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(typeof value === "number" ? 0 : value);
  const prevValueRef = useRef(typeof value === "number" ? 0 : value);

  useEffect(() => {
    if (typeof value !== "number") {
      setDisplayValue(value);
      return;
    }
    const start = typeof prevValueRef.current === "number" ? prevValueRef.current : 0;
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplayValue(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    prevValueRef.current = value;
  }, [value]);

  return (
    <div className={cn(
      "rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:shadow-md",
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {typeof displayValue === "number" ? displayValue.toLocaleString() : displayValue}
        </span>
        {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
      </div>
      {trend && (
        <div className={cn(
          "mt-1.5 flex items-center gap-1 text-xs font-medium",
          trend.direction === "up" ? "text-red-500" : trend.direction === "down" ? "text-emerald-500" : "text-slate-400"
        )}>
          {trend.direction === "up" ? (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
          ) : trend.direction === "down" ? (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          ) : (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
          )}
          {trend.value}
        </div>
      )}
    </div>
  );
}
