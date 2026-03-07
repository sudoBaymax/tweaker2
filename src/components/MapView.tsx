import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { MAP_CENTER, MAP_ZOOM, SafetyPoint, getTimeAdjustedRisk } from "@/data/safetyData";

interface MapViewProps {
  onMapReady?: () => void;
  incidents: SafetyPoint[];
  timeOffset: number;
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

  useEffect(() => {
    if (!map.current || !mapReady) return;

    if (heatLayer.current) {
      map.current.removeLayer(heatLayer.current);
    }

    // Calculate the viewed hour from the offset
    const viewDate = new Date(Date.now() + timeOffset * 60 * 60 * 1000);
    const viewHour = viewDate.getHours();

    const heatData: Array<[number, number, number]> = [];

    for (const p of incidents) {
      // All points stay visible — intensity shifts with viewed hour
      const intensity = getTimeAdjustedRisk(p, viewHour);
      if (intensity > 0.01) {
        heatData.push([p.lat, p.lng, intensity]);
      }
    }

    heatLayer.current = (L as any).heatLayer(heatData, {
      radius: 28,
      blur: 20,
      maxZoom: 17,
      max: 1.0,
      minOpacity: 0.05,
      gradient: {
        0.0: "rgba(0,0,0,0)",
        0.1: "#00221c",
        0.25: "#00ff9c",
        0.45: "#7dff5c",
        0.6: "#ffe600",
        0.75: "#ff8c00",
        0.9: "#ff2a2a",
        1.0: "#7a0000",
      },
    }).addTo(map.current);
  }, [incidents, mapReady, timeOffset]);

  return (
    <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
  );
};

export default MapView;
