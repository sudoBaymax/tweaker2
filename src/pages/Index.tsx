import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import SearchBar from "@/components/SearchBar";
import RouteCard from "@/components/RouteCard";
import ReportModal from "@/components/ReportModal";
import AlertToast from "@/components/AlertToast";
import SafetyLegend from "@/components/SafetyLegend";
import TimelineSlider from "@/components/TimelineSlider";
import { generateHistoricalIncidents, generateLiveIncident, generateUserReport, SafetyPoint, MAP_CENTER } from "@/data/safetyData";
import { calculateRoutes, resolveDestination, RouteResult } from "@/lib/routing";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const Index = () => {
  const [showRoutes, setShowRoutes] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [incidents, setIncidents] = useState<SafetyPoint[]>([]);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [timeOffset, setTimeOffset] = useState(0);
  const [activeRoute, setActiveRoute] = useState<{ fastest: RouteResult; safest: RouteResult } | null>(null);
  const [selectedRouteType, setSelectedRouteType] = useState<"fastest" | "safest" | null>(null);
  const userLocation = useRef<[number, number]>([MAP_CENTER[1], MAP_CENTER[0]]);

  useEffect(() => {
    setIncidents(generateHistoricalIncidents());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIncidents((prev) => {
        const now = Date.now();
        const cutoff = now - 24 * 60 * 60 * 1000;
        const newCount = 2 + Math.floor(Math.random() * 3);
        const newIncidents = Array.from({ length: newCount }, () => generateLiveIncident());
        return [...prev.filter((p) => p.timestamp > cutoff), ...newIncidents];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    userLocation.current = [lat, lng];
  }, []);

  const handleSearch = useCallback(async (from: string, to: string) => {
    const dest = resolveDestination(to);
    if (!dest) return;

    const viewDate = new Date(Date.now() + timeOffset * 60 * 60 * 1000);
    const viewHour = viewDate.getHours();

    const startLat = userLocation.current[0];
    const startLng = userLocation.current[1];

    const routes = await calculateRoutes(startLat, startLng, dest[0], dest[1], incidents, viewHour);
    setActiveRoute(routes);
    setSelectedRouteType(null);
    setShowRoutes(true);
  }, [incidents, timeOffset]);

  const handleReport = useCallback((category: string) => {
    const report = generateUserReport(category);
    setIncidents((prev) => [...prev, report]);
    setToast({ visible: true, message: "REPORT SUBMITTED — HEATMAP UPDATED" });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  }, []);

  const handleSelectRoute = useCallback((type: "fastest" | "safest") => {
    setSelectedRouteType(type);
    setShowRoutes(false);
    setToast({
      visible: true,
      message: type === "safest"
        ? `NAVIGATING SAFEST ROUTE — ${activeRoute?.safest.walkMinutes} MIN ✓`
        : `NAVIGATING FASTEST ROUTE — ${activeRoute?.fastest.walkMinutes} MIN`,
    });
    setTimeout(() => setToast({ visible: false, message: "" }), 4000);
  }, [activeRoute]);

  const handleCloseRoutes = useCallback(() => {
    setShowRoutes(false);
    setActiveRoute(null);
    setSelectedRouteType(null);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      <MapView
        incidents={incidents}
        timeOffset={timeOffset}
        onLocationFound={handleLocationFound}
        activeRoute={activeRoute}
        selectedRouteType={selectedRouteType}
      />
      <Header />
      <AlertToast visible={toast.visible} message={toast.message} />

      {/* Demo mode badge */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass px-3 py-1 text-[10px] text-muted-foreground font-mono tracking-widest uppercase"
        >
          DEMO MODE — SIMULATED SAFETY SIGNALS
        </motion.div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 flex flex-col gap-3 max-w-lg mx-auto">
        <div className="flex justify-center">
          <SafetyLegend />
        </div>

        <TimelineSlider value={timeOffset} onChange={setTimeOffset} />

        <SearchBar onSearch={handleSearch} />

        <RouteCard
          visible={showRoutes}
          onClose={handleCloseRoutes}
          onSelectRoute={handleSelectRoute}
          fastest={activeRoute?.fastest}
          safest={activeRoute?.safest}
        />

        {!showRoutes && !selectedRouteType && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2"
          >
            <button
              onClick={() => setReportOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 glass py-3 text-base font-bold text-danger uppercase tracking-wider hover:bg-danger/10 transition-colors"
            >
              <AlertTriangle className="w-5 h-5" />
              REPORT ISSUE
            </button>
          </motion.div>
        )}

        {selectedRouteType && (
          <button
            onClick={handleCloseRoutes}
            className="glass py-3 text-base font-bold text-foreground uppercase tracking-wider hover:bg-muted transition-colors text-center"
          >
            CANCEL NAVIGATION
          </button>
        )}
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
      />
    </div>
  );
};

export default Index;
