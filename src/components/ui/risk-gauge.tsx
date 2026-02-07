"use client";

import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  value: number; // 0-100
  size?: number;
  label?: string;
  className?: string;
}

function getColor(value: number): string {
  if (value >= 75) return "#ef4444";
  if (value >= 50) return "#f97316";
  if (value >= 30) return "#eab308";
  return "#22c55e";
}

function getLabel(value: number): string {
  if (value >= 75) return "Severe";
  if (value >= 50) return "Warning";
  if (value >= 30) return "Watch";
  return "Normal";
}

export function RiskGauge({ value, size = 120, label, className }: RiskGaugeProps) {
  const color = getColor(value);
  const riskLabel = label ?? getLabel(value);
  const radius = (size - 16) / 2;
  const circumference = Math.PI * radius; // half circle
  const progress = (value / 100) * circumference;
  const center = size / 2;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M 8 ${center} A ${radius} ${radius} 0 0 1 ${size - 8} ${center}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M 8 ${center} A ${radius} ${radius} 0 0 1 ${size - 8} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-700 ease-out"
        />
        {/* Value text */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          className="text-2xl font-bold"
          fill={color}
          style={{ fontSize: size * 0.22 }}
        >
          {value}
        </text>
        {/* Label */}
        <text
          x={center}
          y={center + 12}
          textAnchor="middle"
          className="text-xs"
          fill="#64748b"
          style={{ fontSize: size * 0.1 }}
        >
          {riskLabel}
        </text>
      </svg>
    </div>
  );
}
