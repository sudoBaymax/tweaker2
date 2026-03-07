import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { MAP_CENTER, MAP_ZOOM, SafetyPoint, getTimeAdjustedRisk } from "@/data/safetyData";

interface MapViewProps {
  onMapReady?: () => void;
  incidents: SafetyPoint[];
  timeOffset: number;
  onLocationFound?: (lat: number, lng: number) => void;
}

declare module "leaflet" {
  function heatLayer(
    latlngs: Array<[number, number, number]>,
    options?: Record<string, unknown>
  ): L.Layer;
}

const MapView = ({ onMapReady, incidents, timeOffset, onLocationFound }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const heatLayer = useRef<L.Layer | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = L.map(mapContainer.current, {
      center: [MAP_CENTER[1], MAP_CENTER[0]],
      zoom: MAP_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    // Lighter tile layer — CartoDB Voyager (light, readable, street labels)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map.current);

    const userIcon = L.divIcon({
      className: "",
      html: `<div style="width:18px;height:18px;background:hsl(217,100%,55%);border-radius:50%;border:4px solid hsla(217,100%,55%,0.3);box-shadow:0 0 20px hsla(217,100%,55%,0.5);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    // Default marker at map center
    userMarker.current = L.marker([MAP_CENTER[1], MAP_CENTER[0]], { icon: userIcon }).addTo(map.current);

    // Try to get actual geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (map.current && userMarker.current) {
            map.current.setView([latitude, longitude], MAP_ZOOM);
            userMarker.current.setLatLng([latitude, longitude]);
            onLocationFound?.(latitude, longitude);
          }
        },
        () => {
          // Geolocation denied or failed — keep default center
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

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

    const viewDate = new Date(Date.now() + timeOffset * 60 * 60 * 1000);
    const viewHour = viewDate.getHours();

    const heatData: Array<[number, number, number]> = [];

    for (const p of incidents) {
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
      minOpacity: 0.08,
      gradient: {
        0.0: "rgba(0,0,0,0)",
        0.15: "rgba(0,180,100,0.3)",
        0.3: "rgba(0,200,80,0.5)",
        0.45: "rgba(200,220,0,0.6)",
        0.6: "rgba(255,200,0,0.7)",
        0.75: "rgba(255,120,0,0.8)",
        0.9: "rgba(255,40,40,0.85)",
        1.0: "rgba(180,0,0,0.9)",
      },
    }).addTo(map.current);
  }, [incidents, mapReady, timeOffset]);

  return (
    <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
  );
};

export default MapView;
