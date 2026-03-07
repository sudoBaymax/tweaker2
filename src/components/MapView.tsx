import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { MAP_CENTER, MAP_ZOOM, SafetyPoint, getTimeAdjustedRisk } from "@/data/safetyData";
import { RouteResult } from "@/lib/routing";

interface MapViewProps {
  onMapReady?: () => void;
  incidents: SafetyPoint[];
  timeOffset: number;
  onLocationFound?: (lat: number, lng: number) => void;
  activeRoute?: { fastest: RouteResult; safest: RouteResult } | null;
  selectedRouteType?: "fastest" | "safest" | null;
}

declare module "leaflet" {
  function heatLayer(
    latlngs: Array<[number, number, number]>,
    options?: Record<string, unknown>
  ): L.Layer;
}

const MapView = ({ onMapReady, incidents, timeOffset, onLocationFound, activeRoute, selectedRouteType }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const heatLayer = useRef<L.Layer | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const routeLayers = useRef<L.Polyline[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = L.map(mapContainer.current, {
      center: [MAP_CENTER[1], MAP_CENTER[0]],
      zoom: MAP_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map.current);

    const userIcon = L.divIcon({
      className: "",
      html: `<div style="width:18px;height:18px;background:hsl(217,100%,55%);border-radius:50%;border:4px solid hsla(217,100%,55%,0.3);box-shadow:0 0 20px hsla(217,100%,55%,0.5);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    userMarker.current = L.marker([MAP_CENTER[1], MAP_CENTER[0]], { icon: userIcon }).addTo(map.current);

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
        () => {},
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

  // Draw route polylines
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Clear old routes
    for (const layer of routeLayers.current) {
      map.current.removeLayer(layer);
    }
    routeLayers.current = [];

    if (!activeRoute) return;

    // If a route is selected, only show that one. Otherwise show both.
    if (selectedRouteType) {
      const route = selectedRouteType === "safest" ? activeRoute.safest : activeRoute.fastest;
      const color = selectedRouteType === "safest" ? "hsl(157,100%,50%)" : "hsl(50,100%,50%)";
      const polyline = L.polyline(
        route.waypoints.map(([lat, lng]) => [lat, lng] as L.LatLngExpression),
        { color, weight: 5, opacity: 0.9, dashArray: undefined }
      ).addTo(map.current);
      routeLayers.current.push(polyline);

      // Add destination marker
      const destPoint = route.waypoints[route.waypoints.length - 1];
      const destIcon = L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;background:hsl(0,77%,62%);border:3px solid hsl(0,0%,100%);border-radius:0;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const destMarker = L.marker(destPoint as L.LatLngExpression, { icon: destIcon }).addTo(map.current);
      routeLayers.current.push(destMarker as any);

      // Fit bounds
      map.current.fitBounds(polyline.getBounds(), { padding: [60, 60] });
    } else {
      // Show both routes as preview
      const fastPolyline = L.polyline(
        activeRoute.fastest.waypoints.map(([lat, lng]) => [lat, lng] as L.LatLngExpression),
        { color: "hsl(50,100%,50%)", weight: 4, opacity: 0.6, dashArray: "8 6" }
      ).addTo(map.current);
      routeLayers.current.push(fastPolyline);

      const safePolyline = L.polyline(
        activeRoute.safest.waypoints.map(([lat, lng]) => [lat, lng] as L.LatLngExpression),
        { color: "hsl(157,100%,50%)", weight: 5, opacity: 0.8 }
      ).addTo(map.current);
      routeLayers.current.push(safePolyline);

      // Destination marker
      const destPoint = activeRoute.safest.waypoints[activeRoute.safest.waypoints.length - 1];
      const destIcon = L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;background:hsl(0,77%,62%);border:3px solid hsl(0,0%,100%);border-radius:0;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const destMarker = L.marker(destPoint as L.LatLngExpression, { icon: destIcon }).addTo(map.current);
      routeLayers.current.push(destMarker as any);

      // Fit bounds to show both
      const allPoints = [...activeRoute.fastest.waypoints, ...activeRoute.safest.waypoints];
      const bounds = L.latLngBounds(allPoints.map(([lat, lng]) => [lat, lng] as L.LatLngExpression));
      map.current.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [activeRoute, selectedRouteType, mapReady]);

  // Heatmap
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
