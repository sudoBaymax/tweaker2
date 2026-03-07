export interface SafetyPoint {
  lat: number;
  lng: number;
  risk: number; // 0 to 1
  category?: string;
  type?: IncidentType;
  timestamp: number;
}

export type IncidentType =
  | "disturbance"
  | "theft"
  | "assault"
  | "suspicious_person"
  | "property_damage"
  | "robbery";

const INCIDENT_TYPES: { type: IncidentType; weight: number }[] = [
  { type: "disturbance", weight: 0.35 },
  { type: "theft", weight: 0.20 },
  { type: "assault", weight: 0.15 },
  { type: "suspicious_person", weight: 0.15 },
  { type: "property_damage", weight: 0.10 },
  { type: "robbery", weight: 0.05 },
];

const SEVERITY_BY_TYPE: Record<IncidentType, [number, number]> = {
  robbery: [0.8, 1.0],
  assault: [0.75, 0.95],
  disturbance: [0.3, 0.6],
  theft: [0.4, 0.7],
  suspicious_person: [0.35, 0.65],
  property_damage: [0.3, 0.55],
};

// Hotspot clusters around Waterloo
const HOTSPOTS = [
  { name: "University Campus", lat: 43.4723, lng: -80.5449, weight: 1.0, spread: 0.008 },
  { name: "Downtown Bars", lat: 43.4660, lng: -80.5230, weight: 1.8, spread: 0.005 },
  { name: "Transit Hub", lat: 43.4530, lng: -80.5220, weight: 1.5, spread: 0.004 },
  { name: "Park Trails", lat: 43.4580, lng: -80.5390, weight: 1.6, spread: 0.004 },
  { name: "Parking Area North", lat: 43.4780, lng: -80.5550, weight: 1.3, spread: 0.005 },
  { name: "Strip Mall South", lat: 43.4620, lng: -80.5350, weight: 1.1, spread: 0.006 },
];

function randomOffset(range: number): number {
  // Gaussian-ish distribution for clustering
  const u1 = Math.random();
  const u2 = Math.random();
  const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return gauss * range * 0.5;
}

function pickIncidentType(): IncidentType {
  const r = Math.random();
  let cum = 0;
  for (const t of INCIDENT_TYPES) {
    cum += t.weight;
    if (r <= cum) return t.type;
  }
  return "disturbance";
}

/** Time-of-day crime multiplier */
export function crimeMultiplier(hour: number): number {
  if (hour >= 22 || hour <= 2) return 2.5;
  if (hour >= 18) return 1.6;
  if (hour >= 12) return 1.2;
  return 0.6;
}

/** Weekend spike */
function weekendMultiplier(date: Date): number {
  const day = date.getDay();
  // Friday=5, Saturday=6
  if (day === 6 && date.getHours() <= 3) return 1.5; // Saturday early AM (bar closing)
  if (day === 5 && date.getHours() >= 22) return 1.4;
  if (day === 6 && date.getHours() >= 22) return 1.3;
  return 1.0;
}

/** Decay weight based on age of event */
export function timeDecay(eventTimestamp: number, now: number): number {
  const hoursAgo = (now - eventTimestamp) / (1000 * 60 * 60);
  if (hoursAgo <= 4) return 1.0;
  if (hoursAgo <= 12) return 0.6;
  if (hoursAgo <= 24) return 0.3;
  return 0.05;
}

/** Generate a batch of realistic incidents for the past 24 hours */
export function generateHistoricalIncidents(): SafetyPoint[] {
  const now = Date.now();
  const points: SafetyPoint[] = [];
  const hoursBack = 24;

  // Walk backwards through time in 30-min slots
  for (let h = 0; h < hoursBack * 2; h++) {
    const slotTime = now - h * 30 * 60 * 1000;
    const date = new Date(slotTime);
    const hour = date.getHours();

    const baseCount = 1.2; // base events per 30-min slot
    const multiplier = crimeMultiplier(hour) * weekendMultiplier(date);
    const eventCount = Math.round(baseCount * multiplier + (Math.random() - 0.3));

    for (let e = 0; e < Math.max(0, eventCount); e++) {
      // Pick a random hotspot weighted by its weight
      const totalWeight = HOTSPOTS.reduce((s, h) => s + h.weight, 0);
      let r = Math.random() * totalWeight;
      let hotspot = HOTSPOTS[0];
      for (const hs of HOTSPOTS) {
        r -= hs.weight;
        if (r <= 0) { hotspot = hs; break; }
      }

      // Bar-closing spike: boost bar hotspot weight at 1-3 AM
      if ((hour >= 1 && hour <= 3) && hotspot.name !== "Downtown Bars" && Math.random() < 0.4) {
        hotspot = HOTSPOTS[1]; // Force to bars
      }

      const type = pickIncidentType();
      const [minSev, maxSev] = SEVERITY_BY_TYPE[type];

      // Night events are more severe
      const nightBoost = (hour >= 22 || hour <= 4) ? 0.1 : 0;

      points.push({
        lat: hotspot.lat + randomOffset(hotspot.spread),
        lng: hotspot.lng + randomOffset(hotspot.spread),
        risk: Math.min(1, minSev + Math.random() * (maxSev - minSev) + nightBoost),
        type,
        timestamp: slotTime + Math.random() * 30 * 60 * 1000,
      });
    }
  }

  return points;
}

/** Generate a single new live incident */
export function generateLiveIncident(): SafetyPoint {
  const now = Date.now();
  const hour = new Date(now).getHours();
  const multiplier = crimeMultiplier(hour);

  // Pick hotspot
  const totalWeight = HOTSPOTS.reduce((s, h) => s + h.weight * multiplier, 0);
  let r = Math.random() * totalWeight;
  let hotspot = HOTSPOTS[0];
  for (const hs of HOTSPOTS) {
    r -= hs.weight * multiplier;
    if (r <= 0) { hotspot = hs; break; }
  }

  const type = pickIncidentType();
  const [minSev, maxSev] = SEVERITY_BY_TYPE[type];
  const nightBoost = (hour >= 22 || hour <= 4) ? 0.1 : 0;

  return {
    lat: hotspot.lat + randomOffset(hotspot.spread),
    lng: hotspot.lng + randomOffset(hotspot.spread),
    risk: Math.min(1, minSev + Math.random() * (maxSev - minSev) + nightBoost),
    type,
    timestamp: now,
  };
}

/** Generate a user-submitted report */
export function generateUserReport(category: string): SafetyPoint {
  const CENTER_LAT = 43.4723;
  const CENTER_LNG = -80.5449;
  return {
    lat: CENTER_LAT + randomOffset(0.012),
    lng: CENTER_LNG + randomOffset(0.012),
    risk: 0.85 + Math.random() * 0.15,
    category,
    timestamp: Date.now(),
  };
}

export const MAP_CENTER: [number, number] = [-80.5449, 43.4723];
export const MAP_ZOOM = 13;
