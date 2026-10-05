import { BUILDINGS, CAMPUS_CENTER } from "@/lib/constants";
import type { Building } from "@/types";

export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Project campus lat/lng onto the 0–100 stylized map plane. */
export function lngLatToXY(lat: number, lng: number): { x: number; y: number } {
  const latSpan = 0.0042;
  const lngSpan = 0.0036;
  const x = ((lng - (CAMPUS_CENTER.lng - lngSpan / 2)) / lngSpan) * 100;
  const y = ((CAMPUS_CENTER.lat + latSpan / 2 - lat) / latSpan) * 100;
  return {
    x: Math.min(98, Math.max(2, x)),
    y: Math.min(98, Math.max(2, y)),
  };
}

export function xyToLngLat(x: number, y: number): { lat: number; lng: number } {
  const latSpan = 0.0042;
  const lngSpan = 0.0036;
  const lng = CAMPUS_CENTER.lng - lngSpan / 2 + (x / 100) * lngSpan;
  const lat = CAMPUS_CENTER.lat + latSpan / 2 - (y / 100) * latSpan;
  return { lat, lng };
}

export function nearestBuilding(lat: number, lng: number): Building {
  let best = BUILDINGS[0];
  let bestD = Infinity;
  for (const b of BUILDINGS) {
    const d = haversineMeters({ lat, lng }, { lat: b.lat, lng: b.lng });
    if (d < bestD) {
      bestD = d;
      best = b;
    }
  }
  return best;
}

export function placeNameFrom(lat: number, lng: number, building?: string): string {
  const b = building || nearestBuilding(lat, lng).name;
  return `${b}, ${CAMPUS_CENTER.lat.toFixed(3)}°N`;
}

export function jaccard(a: string, b: string): number {
  const tok = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2),
    );
  const A = tok(a);
  const B = tok(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  A.forEach((w) => {
    if (B.has(w)) inter += 1;
  });
  return inter / (A.size + B.size - inter);
}
