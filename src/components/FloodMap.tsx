"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface ZonePrediction {
  zone_id: string;
  zone_name: string;
  risk_score: number;
  risk_category: "Normal" | "Watch" | "Warning" | "Severe";
  explanation: string;
  rainfall_trend: number;
  river_level_trend: number;
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

const RISK_COLORS: Record<string, string> = {
  Normal: "#22c55e",
  Watch: "#eab308",
  Warning: "#f97316",
  Severe: "#ef4444",
};

const RISK_FILL_OPACITY: Record<string, number> = {
  Normal: 0.2,
  Watch: 0.35,
  Warning: 0.45,
  Severe: 0.6,
};

function MapBounds({ zones }: { zones: FloodZone[] }) {
  const map = useMap();
  useEffect(() => {
    if (zones.length > 0) {
      const bounds = zones.map((z) => [z.lat, z.lng] as [number, number]);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [zones, map]);
  return null;
}

export default function FloodMap({
  predictions,
  zones,
}: {
  predictions: ZonePrediction[];
  zones: FloodZone[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100">
        <div className="text-sm text-slate-500">Loading map...</div>
      </div>
    );
  }

  const getPrediction = (zoneId: string) =>
    predictions.find((p) => p.zone_id === zoneId);

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-slate-200">
      <MapContainer
        center={[24.9, 91.87]}
        zoom={9}
        className="h-full w-full"
        style={{ minHeight: "400px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds zones={zones} />
        {zones.map((zone) => {
          const pred = getPrediction(zone.id);
          const category = pred?.risk_category || "Normal";
          const color = RISK_COLORS[category];
          const fillOpacity = RISK_FILL_OPACITY[category];

          return (
            <CircleMarker
              key={zone.id}
              center={[zone.lat, zone.lng]}
              radius={zone.radius_km * 3}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[220px] text-sm">
                  <div className="mb-1.5 text-base font-bold text-slate-800">
                    {zone.name}
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-semibold" style={{ color }}>
                      {category}
                    </span>
                    <span className="text-slate-500">
                      Score: {pred?.risk_score ?? "N/A"}/100
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div>Elevation: {zone.elevation_m}m</div>
                    <div>Vulnerability: {zone.vulnerability}</div>
                    <div>Population: {zone.population.toLocaleString()}</div>
                    <div>Rainfall trend: {pred?.rainfall_trend ?? "N/A"}</div>
                    <div>River level trend: {pred?.river_level_trend ?? "N/A"}</div>
                  </div>
                  {pred?.explanation && (
                    <div className="mt-2 rounded bg-slate-50 p-1.5 text-xs text-slate-700">
                      {pred.explanation}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
