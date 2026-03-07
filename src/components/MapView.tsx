import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { MAP_CENTER, MAP_ZOOM, SafetyPoint, timeDecay } from "@/data/safetyData";

interface MapViewProps {
  onMapReady?: () => void;
  incidents: SafetyPoint[];
  timeOffset: number; // hours offset from now (negative = past)
}

declare module "leaflet" {
  function heatLayer(
    latlngs: Array<[number, number, number]>,
    options?: Record<string, unknown>
  ): L.Layer;
}

const MapView = ({ onMapReady, incidents, timeOffset }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const heatLayer = useRef<L.Layer | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = L.map(mapContainer.current, {
      center: [MAP_CENTER[1], MAP_CENTER[0]],
      zoom: MAP_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map.current);

    const userIcon = L.divIcon({
      className: "",
      html: `<div style="width:16px;height:16px;background:hsl(157,100%,50%);border-radius:50%;border:3px solid hsla(157,100%,50%,0.3);box-shadow:0 0 20px hsla(157,100%,50%,0.5);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([MAP_CENTER[1], MAP_CENTER[0]], { icon: userIcon }).addTo(map.current);

    setMapReady(true);
    onMapReady?.();

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update heatmap
  useEffect(() => {
    if (!map.current || !mapReady) return;

    if (heatLayer.current) {
      map.current.removeLayer(heatLayer.current);
    }

    // The "viewpoint" time — if slider is at -6, we look at 6 hours ago
    const viewTime = Date.now() + timeOffset * 60 * 60 * 1000;

    // Filter incidents within 24h window of viewTime and apply decay
    const heatData: Array<[number, number, number]> = [];
    for (const p of incidents) {
      const age = viewTime - p.timestamp;
      if (age < 0 || age > 24 * 60 * 60 * 1000) continue;
      const decay = timeDecay(p.timestamp, viewTime);
      const intensity = p.risk * decay;
      if (intensity > 0.02) {
        heatData.push([p.lat, p.lng, intensity]);
      }
    }

    heatLayer.current = (L as any).heatLayer(heatData, {
      radius: 35,
      blur: 22,
      maxZoom: 17,
      max: 1.0,
      minOpacity: 0.08,
      gradient: {
        0.0: "rgba(0,0,0,0)",
        0.15: "rgba(0,0,0,0)",
        0.35: "#ffd400",
        0.55: "#ff8800",
        0.75: "#ff3b3b",
        1.0: "#ff0000",
      },
    }).addTo(map.current);
  }, [incidents, mapReady, timeOffset]);

  return (
    <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
  );
};

export default MapView;
