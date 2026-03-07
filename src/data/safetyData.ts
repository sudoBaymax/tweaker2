export interface SafetyPoint {
  lat: number;
  lng: number;
  risk: number; // 0 to 1
  category?: string;
  timestamp?: number;
}

// Center: University of Waterloo area (Waterloo, ON)
const CENTER_LAT = 43.4723;
const CENTER_LNG = -80.5449;

function randomOffset(range: number): number {
  return (Math.random() - 0.5) * range * 2;
}

function generateCluster(
  centerLat: number,
  centerLng: number,
  count: number,
  riskRange: [number, number],
  spread: number
): SafetyPoint[] {
  const points: SafetyPoint[] = [];
  for (let i = 0; i < count; i++) {
    points.push({
      lat: centerLat + randomOffset(spread),
      lng: centerLng + randomOffset(spread),
      risk: riskRange[0] + Math.random() * (riskRange[1] - riskRange[0]),
    });
  }
  return points;
}

// Generate realistic clusters
const safeZones = generateCluster(CENTER_LAT, CENTER_LNG, 120, [0.05, 0.25], 0.015);
const campusSafe = generateCluster(43.4715, -80.5440, 80, [0.05, 0.2], 0.008);

// Medium risk: bar district, transit
const barDistrict = generateCluster(43.4660, -80.5230, 35, [0.4, 0.65], 0.006);
const transitHub = generateCluster(43.4530, -80.5220, 25, [0.35, 0.6], 0.005);

// High risk: parks at night, isolated areas
const parkNight = generateCluster(43.4580, -80.5390, 15, [0.7, 0.95], 0.004);
const isolatedArea = generateCluster(43.4780, -80.5550, 15, [0.7, 0.9], 0.005);

export const safetyData: SafetyPoint[] = [
  ...safeZones,
  ...campusSafe,
  ...barDistrict,
  ...transitHub,
  ...parkNight,
  ...isolatedArea,
];

export function generateRandomReport(): SafetyPoint {
  const categories = ['suspicious_activity', 'poor_lighting', 'harassment', 'unsafe_area'];
  return {
    lat: CENTER_LAT + randomOffset(0.02),
    lng: CENTER_LNG + randomOffset(0.02),
    risk: 0.5 + Math.random() * 0.5,
    category: categories[Math.floor(Math.random() * categories.length)],
    timestamp: Date.now(),
  };
}

export const MAP_CENTER: [number, number] = [CENTER_LNG, CENTER_LAT];
export const MAP_ZOOM = 13;
