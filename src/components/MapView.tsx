import { useEffect, useRef, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { safetyData, generateRandomReport, MAP_CENTER, MAP_ZOOM, SafetyPoint } from "@/data/safetyData";

// Mapbox public token (free tier demo)
mapboxgl.accessToken = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNtOTdxcnVuNjBhbzAya3NjMWdicXU4NjEifQ.unused";

interface MapViewProps {
  onMapReady?: () => void;
  newReports: SafetyPoint[];
}

const MapView = ({ onMapReady, newReports }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const updateHeatmapData = useCallback(() => {
    if (!map.current || !mapLoaded) return;
    const source = map.current.getSource("safety-data") as mapboxgl.GeoJSONSource;
    if (!source) return;

    const allPoints = [...safetyData, ...newReports];
    source.setData({
      type: "FeatureCollection",
      features: allPoints.map((p) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.lng, p.lat],
        },
        properties: {
          risk: p.risk,
        },
      })),
    });
  }, [newReports, mapLoaded]);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      attributionControl: false,
    });

    map.current.on("load", () => {
      if (!map.current) return;

      // Add heatmap source
      map.current.addSource("safety-data", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: safetyData.map((p) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [p.lng, p.lat],
            },
            properties: {
              risk: p.risk,
            },
          })),
        },
      });

      // Add heatmap layer
      map.current.addLayer({
        id: "safety-heatmap",
        type: "heatmap",
        source: "safety-data",
        paint: {
          "heatmap-weight": ["get", "risk"],
          "heatmap-intensity": 1.4,
          "heatmap-radius": 35,
          "heatmap-opacity": 0.8,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.15, "rgba(0,255,156,0.3)",
            0.35, "rgba(0,255,156,0.6)",
            0.55, "rgba(255,212,0,0.7)",
            0.75, "rgba(255,120,0,0.8)",
            1, "rgba(255,59,59,0.9)",
          ],
        },
      });

      // User location marker
      const el = document.createElement("div");
      el.className = "user-marker";
      el.style.cssText = `
        width: 16px; height: 16px;
        background: hsl(157 100% 50%);
        border-radius: 50%;
        border: 3px solid hsl(157 100% 50% / 0.3);
        box-shadow: 0 0 20px hsl(157 100% 50% / 0.5);
      `;

      new mapboxgl.Marker(el)
        .setLngLat(MAP_CENTER)
        .addTo(map.current);

      setMapLoaded(true);
      onMapReady?.();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    updateHeatmapData();
  }, [updateHeatmapData]);

  return (
    <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
  );
};

export default MapView;
