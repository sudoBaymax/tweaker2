import L from "leaflet";
import { SafetyPoint, getTimeAdjustedRisk, HOTSPOTS_PUBLIC } from "@/data/safetyData";

export interface RouteResult {
  waypoints: [number, number][];
  distanceKm: number;
  walkMinutes: number;
  riskScore: number; // 0-1 average risk along route
}

const WALK_SPEED_KMH = 5;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Sample risk at a point from nearby incidents */
function sampleRisk(lat: number, lng: number, incidents: SafetyPoint[], viewHour: number): number {
  let totalWeight = 0;
  let totalRisk = 0;
  const RADIUS = 0.004; // ~400m

  for (const p of incidents) {
    const dist = Math.sqrt((p.lat - lat) ** 2 + (p.lng - lng) ** 2);
    if (dist < RADIUS) {
      const w = 1 - dist / RADIUS;
      totalWeight += w;
      totalRisk += w * getTimeAdjustedRisk(p, viewHour);
    }
  }

  return totalWeight > 0 ? Math.min(1, totalRisk / totalWeight) : 0;
}

/** Generate the direct (fastest) route as a series of interpolated points */
function generateDirectRoute(
  startLat: number, startLng: number,
  endLat: number, endLng: number,
  steps: number
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Add slight natural curve
    const jitterLat = (Math.random() - 0.5) * 0.0003;
    const jitterLng = (Math.random() - 0.5) * 0.0003;
    points.push([
      lerp(startLat, endLat, t) + (i > 0 && i < steps ? jitterLat : 0),
      lerp(startLng, endLng, t) + (i > 0 && i < steps ? jitterLng : 0),
    ]);
  }
  return points;
}

/** Generate a route that curves away from high-crime areas */
function generateSafeRoute(
  startLat: number, startLng: number,
  endLat: number, endLng: number,
  incidents: SafetyPoint[],
  viewHour: number,
  steps: number
): [number, number][] {
  // Start with the direct route
  const points = generateDirectRoute(startLat, startLng, endLat, endLng, steps);
  const hotspots = HOTSPOTS_PUBLIC;

  // Push waypoints away from hotspots iteratively
  for (let iter = 0; iter < 3; iter++) {
    for (let i = 1; i < points.length - 1; i++) {
      let pushLat = 0;
      let pushLng = 0;

      for (const hs of hotspots) {
        const dLat = points[i][0] - hs.lat;
        const dLng = points[i][1] - hs.lng;
        const dist = Math.sqrt(dLat ** 2 + dLng ** 2);
        const dangerRadius = hs.spread * 3;

        if (dist < dangerRadius && dist > 0.0001) {
          const force = ((dangerRadius - dist) / dangerRadius) * 0.002 * (hs.count / 120);
          pushLat += (dLat / dist) * force;
          pushLng += (dLng / dist) * force;
        }
      }

      // Also check incident density
      const risk = sampleRisk(points[i][0], points[i][1], incidents, viewHour);
      if (risk > 0.3) {
        // Push perpendicular to route direction
        const dx = endLat - startLat;
        const dy = endLng - startLng;
        const perpLat = -dy;
        const perpLng = dx;
        const mag = Math.sqrt(perpLat ** 2 + perpLng ** 2) || 1;
        pushLat += (perpLat / mag) * risk * 0.001;
        pushLng += (perpLng / mag) * risk * 0.001;
      }

      points[i] = [points[i][0] + pushLat, points[i][1] + pushLng];
    }
  }

  return points;
}

function routeDistance(points: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1]);
  }
  return total;
}

function routeRiskScore(
  points: [number, number][],
  incidents: SafetyPoint[],
  viewHour: number
): number {
  let totalRisk = 0;
  for (const [lat, lng] of points) {
    totalRisk += sampleRisk(lat, lng, incidents, viewHour);
  }
  return totalRisk / points.length;
}

export function calculateRoutes(
  startLat: number, startLng: number,
  endLat: number, endLng: number,
  incidents: SafetyPoint[],
  viewHour: number
): { fastest: RouteResult; safest: RouteResult } {
  const steps = 20;

  const fastPoints = generateDirectRoute(startLat, startLng, endLat, endLng, steps);
  const safePoints = generateSafeRoute(startLat, startLng, endLat, endLng, incidents, viewHour, steps);

  const fastDist = routeDistance(fastPoints);
  const safeDist = routeDistance(safePoints);

  return {
    fastest: {
      waypoints: fastPoints,
      distanceKm: fastDist,
      walkMinutes: Math.round((fastDist / WALK_SPEED_KMH) * 60),
      riskScore: routeRiskScore(fastPoints, incidents, viewHour),
    },
    safest: {
      waypoints: safePoints,
      distanceKm: safeDist,
      walkMinutes: Math.round((safeDist / WALK_SPEED_KMH) * 60),
      riskScore: routeRiskScore(safePoints, incidents, viewHour),
    },
  };
}

/** Known destination locations for demo */
export const KNOWN_DESTINATIONS: Record<string, [number, number]> = {
  // Waterloo
  "conestoga mall": [43.4970, -80.5280],
  "university plaza": [43.4740, -80.5370],
  "waterloo park": [43.4620, -80.5300],
  "laurier": [43.4735, -80.5280],
  "uptown waterloo": [43.4660, -80.5230],
  "columbia lake": [43.4780, -80.5550],
  "uw": [43.4723, -80.5449],
  "waterloo town square": [43.4640, -80.5205],
  // Kitchener
  "downtown kitchener": [43.4510, -80.4930],
  "charles st terminal": [43.4490, -80.4890],
  "ion station": [43.4530, -80.5220],
  "victoria park": [43.4480, -80.4950],
  "kitchener market": [43.4530, -80.4870],
  "fairview park mall": [43.4250, -80.4390],
  "fairview mall": [43.4250, -80.4390],
  "stanley park": [43.4150, -80.4600],
  // Cambridge
  "downtown galt": [43.3570, -80.3120],
  "galt": [43.3570, -80.3120],
  "hespeler": [43.3920, -80.3100],
  "preston": [43.3990, -80.3520],
  "cambridge centre": [43.3780, -80.3250],
  "cambridge centre mall": [43.3780, -80.3250],
  "cambridge": [43.3600, -80.3200],
  "langs": [43.3700, -80.3400],
};

/** Fuzzy match a destination string to coordinates */
export function resolveDestination(query: string): [number, number] | null {
  const q = query.toLowerCase().trim();
  for (const [name, coords] of Object.entries(KNOWN_DESTINATIONS)) {
    if (q.includes(name) || name.includes(q)) return coords;
  }
  // Fallback: random point in tri-city area
  return [43.4200 + (Math.random() - 0.5) * 0.06, -80.4500 + (Math.random() - 0.5) * 0.08];
}
