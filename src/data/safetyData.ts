export interface SafetyPoint {
  lat: number;
  lng: number;
  risk: number;
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
  | "robbery"
  | "drug_activity";

const INCIDENT_TYPES: { type: IncidentType; weight: number; severity: [number, number] }[] = [
  { type: "disturbance", weight: 0.35, severity: [0.2, 0.55] },
  { type: "theft", weight: 0.20, severity: [0.35, 0.65] },
  { type: "suspicious_person", weight: 0.15, severity: [0.25, 0.55] },
  { type: "assault", weight: 0.10, severity: [0.7, 0.95] },
  { type: "property_damage", weight: 0.10, severity: [0.25, 0.5] },
  { type: "robbery", weight: 0.05, severity: [0.75, 1.0] },
  { type: "drug_activity", weight: 0.05, severity: [0.4, 0.7] },
];

const HOTSPOTS = [
  { name: "UW Campus Core", lat: 43.4723, lng: -80.5449, count: 120, spread: 0.003 },
  { name: "UW Ring Road", lat: 43.4710, lng: -80.5420, count: 80, spread: 0.002 },
  { name: "UW South Campus", lat: 43.4690, lng: -80.5460, count: 60, spread: 0.002 },
  { name: "Laurier Campus", lat: 43.4735, lng: -80.5280, count: 90, spread: 0.003 },
  { name: "King St Nightlife", lat: 43.4520, lng: -80.4920, count: 100, spread: 0.002 },
  { name: "Uptown Waterloo Bars", lat: 43.4660, lng: -80.5230, count: 80, spread: 0.003 },
  { name: "Downtown Kitchener", lat: 43.4510, lng: -80.4930, count: 70, spread: 0.003 },
  { name: "ION Transit Hub", lat: 43.4530, lng: -80.5220, count: 50, spread: 0.0015 },
  { name: "Charles St Terminal", lat: 43.4490, lng: -80.4890, count: 45, spread: 0.0015 },
  { name: "University Ave Transit", lat: 43.4680, lng: -80.5350, count: 40, spread: 0.002 },
  { name: "Waterloo Park", lat: 43.4620, lng: -80.5300, count: 35, spread: 0.002 },
  { name: "Columbia Lake Trail", lat: 43.4780, lng: -80.5550, count: 30, spread: 0.002 },
  { name: "Laurel Trail", lat: 43.4580, lng: -80.5390, count: 25, spread: 0.0015 },
  { name: "Conestoga Mall Lot", lat: 43.4970, lng: -80.5280, count: 25, spread: 0.002 },
  { name: "University Plaza Lot", lat: 43.4740, lng: -80.5370, count: 20, spread: 0.0015 },
];

// Background noise spread across the whole area
const BG_CENTER = { lat: 43.465, lng: -80.520 };
const BG_COUNT = 60;
const BG_SPREAD = 0.025;

function gaussRandom(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2);
}

function pickIncidentType(): { type: IncidentType; severity: [number, number] } {
  const r = Math.random();
  let cum = 0;
  for (const t of INCIDENT_TYPES) {
    cum += t.weight;
    if (r <= cum) return t;
  }
  return INCIDENT_TYPES[0];
}

export function crimeMultiplier(hour: number): number {
  if (hour >= 22 || hour <= 2) return 2.8;
  if (hour >= 18) return 1.8;
  if (hour >= 12) return 1.2;
  if (hour >= 6) return 0.5;
  return 1.4; // 2am-6am moderate decline
}

function weekendMultiplier(date: Date): number {
  const day = date.getDay();
  const hour = date.getHours();
  if (day === 6 && hour <= 3) return 1.6;
  if (day === 5 && hour >= 22) return 1.5;
  if (day === 6 && hour >= 22) return 1.4;
  if (day === 0 && hour <= 2) return 1.3;
  return 1.0;
}

export function timeDecay(eventTimestamp: number, now: number): number {
  const hoursAgo = (now - eventTimestamp) / (1000 * 60 * 60);
  if (hoursAgo <= 3) return 1.0;
  if (hoursAgo <= 6) return 0.7;
  if (hoursAgo <= 12) return 0.4;
  if (hoursAgo <= 24) return 0.2;
  return 0.0;
}

function generateClusterPoints(
  centerLat: number,
  centerLng: number,
  count: number,
  spread: number,
  now: number
): SafetyPoint[] {
  const points: SafetyPoint[] = [];
  const hoursBack = 24;

  for (let i = 0; i < count; i++) {
    // Distribute timestamps across 24 hours with time-of-day weighting
    // Use rejection sampling for realistic temporal distribution
    let timestamp: number;
    let accepted = false;
    while (!accepted) {
      const hoursAgo = Math.random() * hoursBack;
      timestamp = now - hoursAgo * 60 * 60 * 1000;
      const date = new Date(timestamp!);
      const hour = date.getHours();
      const mult = crimeMultiplier(hour) * weekendMultiplier(date);
      // Accept with probability proportional to multiplier (max ~4.5)
      if (Math.random() < mult / 4.5) {
        accepted = true;
      }
    }

    const { type, severity } = pickIncidentType();
    const date = new Date(timestamp!);
    const hour = date.getHours();
    const nightBoost = (hour >= 22 || hour <= 4) ? 0.12 : 0;

    points.push({
      lat: centerLat + gaussRandom() * spread,
      lng: centerLng + gaussRandom() * spread,
      risk: Math.min(1, severity[0] + Math.random() * (severity[1] - severity[0]) + nightBoost),
      type,
      timestamp: timestamp!,
    });
  }

  return points;
}

export function generateHistoricalIncidents(): SafetyPoint[] {
  const now = Date.now();
  const allPoints: SafetyPoint[] = [];

  // Cluster points
  for (const hs of HOTSPOTS) {
    allPoints.push(...generateClusterPoints(hs.lat, hs.lng, hs.count, hs.spread, now));
  }

  // Background noise
  allPoints.push(...generateClusterPoints(BG_CENTER.lat, BG_CENTER.lng, BG_COUNT, BG_SPREAD, now));

  return allPoints;
}

export function generateLiveIncident(): SafetyPoint {
  const now = Date.now();
  const hour = new Date(now).getHours();
  const mult = crimeMultiplier(hour);

  // Pick hotspot weighted by count * multiplier
  const weights = HOTSPOTS.map((h) => h.count * mult);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let hotspot = HOTSPOTS[0];
  for (let i = 0; i < HOTSPOTS.length; i++) {
    r -= weights[i];
    if (r <= 0) { hotspot = HOTSPOTS[i]; break; }
  }

  const { type, severity } = pickIncidentType();
  const nightBoost = (hour >= 22 || hour <= 4) ? 0.12 : 0;

  return {
    lat: hotspot.lat + gaussRandom() * hotspot.spread,
    lng: hotspot.lng + gaussRandom() * hotspot.spread,
    risk: Math.min(1, severity[0] + Math.random() * (severity[1] - severity[0]) + nightBoost),
    type,
    timestamp: now,
  };
}

export function generateUserReport(category: string): SafetyPoint {
  return {
    lat: 43.4723 + gaussRandom() * 0.008,
    lng: -80.5449 + gaussRandom() * 0.008,
    risk: 0.85 + Math.random() * 0.15,
    category,
    timestamp: Date.now(),
  };
}

export const MAP_CENTER: [number, number] = [-80.5449, 43.4723];
export const MAP_ZOOM = 13;
