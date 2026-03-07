import { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { safetyData, MAP_CENTER, MAP_ZOOM, SafetyPoint } from "@/data/safetyData";

interface MapViewProps {
  onMapReady?: () => void;
  newReports: SafetyPoint[];
}

// Extend leaflet types for heat
declare module "leaflet" {
  function heatLayer(
    latlngs: Array<[number, number, number]>,
    options?: Record<string, unknown>
  ): L.Layer;
}

const MapView = ({ onMapReady, newReports }: MapViewProps) => {
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

    // Dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map.current);

    // User location marker
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

  // Update heatmap whenever data changes
  useEffect(() => {
    if (!map.current || !mapReady) return;

    if (heatLayer.current) {
      map.current.removeLayer(heatLayer.current);
    }

    const allPoints = [...safetyData, ...newReports];
    const heatData: Array<[number, number, number]> = allPoints.map((p) => [
      p.lat,
      p.lng,
      p.risk,
    ]);

    heatLayer.current = (L as any).heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: "#00ff9c",
        0.35: "#00ff9c",
        0.55: "#ffd400",
        0.75: "#ff8800",
        1.0: "#ff3b3b",
      },
    }).addTo(map.current);
  }, [newReports, mapReady]);

  return (
    <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
  );
};

export default MapView;
