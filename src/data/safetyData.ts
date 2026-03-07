/**
 * Safety data calibrated against 2024 WRPS Criminal Offence Summary
 * Source: Waterloo Regional Police Service — UCR Most Serious Violation
 * Total 2024: ~37,786 actual violations across Waterloo Region
 *   - Crimes Against Person: 10,124 (26.8%)
 *   - Crimes Against Property: 22,762 (60.2%)
 *   - Other Criminal Code: 4,900 (13.0%)
 */

export interface SafetyPoint {
  lat: number;
  lng: number;
  risk: number;
  category?: string;
  type?: IncidentType;
  timestamp: number;
}

export type IncidentType =
  | "assault"
  | "theft"
  | "break_enter"
  | "robbery"
  | "sexual_offence"
  | "mischief"
  | "fraud"
  | "mv_theft"
  | "weapons"
  | "threats"
  | "drug_activity";

// Weights derived from 2024 WRPS actual violation counts
const INCIDENT_TYPES: { type: IncidentType; weight: number; severity: [number, number] }[] = [
  { type: "theft",          weight: 0.265, severity: [0.20, 0.50] },  // 5,013 + 5,013 shoplifting
  { type: "assault",        weight: 0.150, severity: [0.55, 0.90] },  // 5,699 assaults
  { type: "fraud",          weight: 0.130, severity: [0.15, 0.35] },  // 3,791 + 1,774 identity
  { type: "mischief",       weight: 0.076, severity: [0.20, 0.45] },  // 2,874
  { type: "break_enter",    weight: 0.054, severity: [0.50, 0.75] },  // 2,042
  { type: "threats",        weight: 0.050, severity: [0.40, 0.70] },  // 1,618 uttering threats
  { type: "mv_theft",       weight: 0.034, severity: [0.45, 0.70] },  // 1,277
  { type: "sexual_offence", weight: 0.025, severity: [0.75, 1.00] },  // 928
  { type: "robbery",        weight: 0.010, severity: [0.80, 1.00] },  // 387
  { type: "weapons",        weight: 0.011, severity: [0.70, 0.95] },  // 399
  { type: "drug_activity",  weight: 0.195, severity: [0.30, 0.60] },  // CDSA + other
];

// ─── HOTSPOTS across Waterloo, Kitchener, Cambridge ────────────────────
export const HOTSPOTS_PUBLIC = [
  // ── WATERLOO ──
  { name: "UW Campus Core",       lat: 43.4723, lng: -80.5449, count: 90,  spread: 0.003 },
  { name: "UW Ring Road",         lat: 43.4710, lng: -80.5420, count: 55,  spread: 0.002 },
  { name: "UW South Campus",      lat: 43.4690, lng: -80.5460, count: 40,  spread: 0.002 },
  { name: "Laurier Campus",       lat: 43.4735, lng: -80.5280, count: 65,  spread: 0.003 },
  { name: "Uptown Waterloo",      lat: 43.4660, lng: -80.5230, count: 75,  spread: 0.003 },
  { name: "Waterloo Town Square", lat: 43.4640, lng: -80.5205, count: 45,  spread: 0.002 },
  { name: "University Ave Corridor", lat: 43.4680, lng: -80.5350, count: 35, spread: 0.002 },
  { name: "Waterloo Park",        lat: 43.4620, lng: -80.5300, count: 25,  spread: 0.002 },
  { name: "Columbia Lake Trail",   lat: 43.4780, lng: -80.5550, count: 20,  spread: 0.002 },
  { name: "Conestoga Mall",       lat: 43.4970, lng: -80.5280, count: 50,  spread: 0.003 },
  { name: "University Plaza",     lat: 43.4740, lng: -80.5370, count: 30,  spread: 0.0015 },

  // ── KITCHENER ──
  { name: "Downtown Kitchener Core",   lat: 43.4510, lng: -80.4930, count: 110, spread: 0.004 },
  { name: "King St Nightlife",         lat: 43.4520, lng: -80.4920, count: 85,  spread: 0.002 },
  { name: "Charles St Terminal",       lat: 43.4490, lng: -80.4890, count: 55,  spread: 0.002 },
  { name: "Victoria Park",            lat: 43.4480, lng: -80.4950, count: 40,  spread: 0.003 },
  { name: "Kitchener Market",         lat: 43.4530, lng: -80.4870, count: 35,  spread: 0.002 },
  { name: "Fairview Park Mall",       lat: 43.4250, lng: -80.4390, count: 50,  spread: 0.003 },
  { name: "ION Transit Hub KW",       lat: 43.4530, lng: -80.5220, count: 40,  spread: 0.0015 },
  { name: "Kitchener South",          lat: 43.4200, lng: -80.4800, count: 45,  spread: 0.004 },
  { name: "Laurel Trail",             lat: 43.4580, lng: -80.5390, count: 20,  spread: 0.0015 },
  { name: "Centreville Chicopee",     lat: 43.4400, lng: -80.4500, count: 35,  spread: 0.003 },
  { name: "Highland Hills",           lat: 43.4350, lng: -80.4700, count: 25,  spread: 0.003 },
  { name: "Stanley Park Area",        lat: 43.4150, lng: -80.4600, count: 30,  spread: 0.003 },

  // ── CAMBRIDGE ──
  { name: "Downtown Galt",            lat: 43.3570, lng: -80.3120, count: 70,  spread: 0.004 },
  { name: "Hespeler Village",         lat: 43.3920, lng: -80.3100, count: 45,  spread: 0.003 },
  { name: "Preston Town Centre",      lat: 43.3990, lng: -80.3520, count: 40,  spread: 0.003 },
  { name: "Cambridge Centre Mall",    lat: 43.3780, lng: -80.3250, count: 55,  spread: 0.003 },
  { name: "Galt Core / Water St",     lat: 43.3550, lng: -80.3150, count: 50,  spread: 0.003 },
  { name: "Langs Community",          lat: 43.3700, lng: -80.3400, count: 30,  spread: 0.003 },
  { name: "Saginaw Parkway Area",     lat: 43.4050, lng: -80.3350, count: 25,  spread: 0.002 },
  { name: "Blair / Homer Watson",     lat: 43.3850, lng: -80.3700, count: 20,  spread: 0.002 },

  // ── Regional corridors ──
  { name: "Fischer-Hallman Corridor",  lat: 43.4350, lng: -80.5400, count: 25,  spread: 0.004 },
  { name: "Weber St Corridor",        lat: 43.4600, lng: -80.5050, count: 30,  spread: 0.005 },
  { name: "Hespeler Rd Commercial",   lat: 43.4100, lng: -80.3800, count: 35,  spread: 0.004 },
];

const HOTSPOTS = HOTSPOTS_PUBLIC;

// Background scatter across the entire tri-city region
const BG_CENTERS = [
  { lat: 43.465, lng: -80.520, count: 40, spread: 0.03 },  // Waterloo
  { lat: 43.440, lng: -80.480, count: 45, spread: 0.03 },  // Kitchener
  { lat: 43.375, lng: -80.325, count: 30, spread: 0.03 },  // Cambridge
];

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
  return 1.4;
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

/** Scale risk by the viewed hour's crime pattern */
export function getTimeAdjustedRisk(point: SafetyPoint, viewHour: number): number {
  const viewMult = crimeMultiplier(viewHour);
  return point.risk * (viewMult / 2.8);
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
    let timestamp: number = now;
    let accepted = false;
    while (!accepted) {
      const hoursAgo = Math.random() * hoursBack;
      timestamp = now - hoursAgo * 60 * 60 * 1000;
      const date = new Date(timestamp);
      const hour = date.getHours();
      const mult = crimeMultiplier(hour) * weekendMultiplier(date);
      if (Math.random() < mult / 4.5) {
        accepted = true;
      }
    }

    const { type, severity } = pickIncidentType();
    const date = new Date(timestamp);
    const hour = date.getHours();
    const nightBoost = (hour >= 22 || hour <= 4) ? 0.12 : 0;

    points.push({
      lat: centerLat + gaussRandom() * spread,
      lng: centerLng + gaussRandom() * spread,
      risk: Math.min(1, severity[0] + Math.random() * (severity[1] - severity[0]) + nightBoost),
      type,
      timestamp,
    });
  }

  return points;
}

export function generateHistoricalIncidents(): SafetyPoint[] {
  const now = Date.now();
  const allPoints: SafetyPoint[] = [];

  for (const hs of HOTSPOTS) {
    allPoints.push(...generateClusterPoints(hs.lat, hs.lng, hs.count, hs.spread, now));
  }

  for (const bg of BG_CENTERS) {
    allPoints.push(...generateClusterPoints(bg.lat, bg.lng, bg.count, bg.spread, now));
  }

  return allPoints;
}

export function generateLiveIncident(): SafetyPoint {
  const now = Date.now();
  const hour = new Date(now).getHours();
  const mult = crimeMultiplier(hour);

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

export function generateUserReport(category: string, intensity: number = 0.85, lat?: number, lng?: number): SafetyPoint[] {
  const centerLat = lat ?? 43.4723;
  const centerLng = lng ?? -80.5449;
  const now = Date.now();
  // Generate a small cluster so it appears as a visible zone
  return Array.from({ length: 5 }, () => ({
    lat: centerLat + gaussRandom() * 0.0003,
    lng: centerLng + gaussRandom() * 0.0003,
    risk: Math.min(1, intensity + Math.random() * 0.05),
    category,
    timestamp: now,
  }));
}

// Center on Kitchener-Waterloo-Cambridge tri-city region
export const MAP_CENTER: [number, number] = [-80.4500, 43.4300];
export const MAP_ZOOM = 12;
