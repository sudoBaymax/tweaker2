import { SafetyPoint, getTimeAdjustedRisk, HOTSPOTS_PUBLIC } from "@/data/safetyData";

export interface RouteResult {
  waypoints: [number, number][];
  distanceKm: number;
  walkMinutes: number;
  riskScore: number; // 0-1 average risk along route
}

const WALK_SPEED_KMH = 5;

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

function routeRiskScore(
  points: [number, number][],
  incidents: SafetyPoint[],
  viewHour: number
): number {
  if (points.length === 0) return 0;
  // Sample every few points to keep it fast
  const step = Math.max(1, Math.floor(points.length / 40));
  let totalRisk = 0;
  let count = 0;
  for (let i = 0; i < points.length; i += step) {
    totalRisk += sampleRisk(points[i][0], points[i][1], incidents, viewHour);
    count++;
  }
  return totalRisk / count;
}

/** Call OSRM demo server for a walking route */
async function fetchOSRMRoute(
  coords: [number, number][] // [lat, lng] pairs
): Promise<{ waypoints: [number, number][]; distanceKm: number; durationMin: number } | null> {
  // OSRM expects lng,lat order
  const coordStr = coords.map(([lat, lng]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/foot/${coordStr}?overview=full&geometries=geojson&steps=false`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.[0]) return null;

    const route = data.routes[0];
    // GeoJSON coords are [lng, lat] — flip to [lat, lng]
    const waypoints: [number, number][] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
    );

    return {
      waypoints,
      distanceKm: route.distance / 1000,
      durationMin: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}

/** Generate avoidance waypoints that steer around crime hotspots */
function generateAvoidanceWaypoints(
  startLat: number, startLng: number,
  endLat: number, endLng: number,
  _incidents: SafetyPoint[],
  _viewHour: number
): [number, number][] {
  const hotspots = HOTSPOTS_PUBLIC;
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;

  // Route direction vector
  const dx = endLat - startLat;
  const dy = endLng - startLng;
  const routeLen = Math.sqrt(dx ** 2 + dy ** 2);
  if (routeLen < 0.001) return []; // too short

  // Perpendicular vector (normalized)
  const perpLat = -dy / routeLen;
  const perpLng = dx / routeLen;

  // Check which hotspots are near the direct path
  let totalPush = 0;
  let pushCount = 0;

  for (const hs of hotspots) {
    // Project hotspot onto route line to see if it's "in the way"
    const toHsLat = hs.lat - startLat;
    const toHsLng = hs.lng - startLng;
    const projection = (toHsLat * dx + toHsLng * dy) / (routeLen ** 2);

    if (projection > 0.05 && projection < 0.95) {
      // Distance from hotspot to route line
      const closestLat = startLat + dx * projection;
      const closestLng = startLng + dy * projection;
      const distToRoute = Math.sqrt((hs.lat - closestLat) ** 2 + (hs.lng - closestLng) ** 2);

      const dangerRadius = hs.spread * 4;
      if (distToRoute < dangerRadius) {
        // Determine which side to push to (away from hotspot)
        const sideSign = ((hs.lat - closestLat) * perpLat + (hs.lng - closestLng) * perpLng) > 0 ? -1 : 1;
        const force = (1 - distToRoute / dangerRadius) * (hs.count / 80) * sideSign;
        totalPush += force;
        pushCount++;
      }
    }
  }

  if (pushCount === 0) return []; // No hotspots near route, no detour needed

  // Calculate offset magnitude
  const avgPush = totalPush / pushCount;
  const offsetMagnitude = Math.min(0.008, Math.abs(avgPush) * 0.003); // Cap the detour
  const sign = avgPush >= 0 ? 1 : -1;

  // Create 1-2 intermediate waypoints offset from the direct path
  const wp1: [number, number] = [
    midLat + perpLat * offsetMagnitude * sign,
    midLng + perpLng * offsetMagnitude * sign,
  ];

  return [wp1];
}

export async function calculateRoutes(
  startLat: number, startLng: number,
  endLat: number, endLng: number,
  incidents: SafetyPoint[],
  viewHour: number
): Promise<{ fastest: RouteResult; safest: RouteResult }> {
  // Build waypoint lists
  const directCoords: [number, number][] = [[startLat, startLng], [endLat, endLng]];
  const avoidanceWps = generateAvoidanceWaypoints(startLat, startLng, endLat, endLng, incidents, viewHour);
  const safeCoords: [number, number][] = [[startLat, startLng], ...avoidanceWps, [endLat, endLng]];

  // Fetch both routes in parallel
  const [fastResult, safeResult] = await Promise.all([
    fetchOSRMRoute(directCoords),
    fetchOSRMRoute(safeCoords),
  ]);

  const makeFallback = (coords: [number, number][]): RouteResult => {
    const dist = haversineKm(coords[0][0], coords[0][1], coords[coords.length - 1][0], coords[coords.length - 1][1]);
    return {
      waypoints: coords,
      distanceKm: dist,
      walkMinutes: Math.round((dist / WALK_SPEED_KMH) * 60),
      riskScore: routeRiskScore(coords, incidents, viewHour),
    };
  };

  const fastest: RouteResult = fastResult
    ? {
        waypoints: fastResult.waypoints,
        distanceKm: fastResult.distanceKm,
        walkMinutes: fastResult.durationMin,
        riskScore: routeRiskScore(fastResult.waypoints, incidents, viewHour),
      }
    : makeFallback(directCoords);

  const safest: RouteResult = safeResult
    ? {
        waypoints: safeResult.waypoints,
        distanceKm: safeResult.distanceKm,
        walkMinutes: safeResult.durationMin,
        riskScore: routeRiskScore(safeResult.waypoints, incidents, viewHour),
      }
    : makeFallback(safeCoords);

  return { fastest, safest };
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  return null;
}
