import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import SearchBar from "@/components/SearchBar";
import RouteCard from "@/components/RouteCard";
import ReportModal from "@/components/ReportModal";
import AlertToast from "@/components/AlertToast";
import SafetyLegend from "@/components/SafetyLegend";
import TimelineSlider from "@/components/TimelineSlider";
import { generateHistoricalIncidents, generateLiveIncident, generateUserReport, SafetyPoint } from "@/data/safetyData";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const Index = () => {
  const [showRoutes, setShowRoutes] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [incidents, setIncidents] = useState<SafetyPoint[]>([]);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [timeOffset, setTimeOffset] = useState(0);

  // Generate historical data on mount
  useEffect(() => {
    setIncidents(generateHistoricalIncidents());
  }, []);

  // Live: add new incidents & prune old ones every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIncidents((prev) => {
        const now = Date.now();
        const cutoff = now - 24 * 60 * 60 * 1000;
        // Add 2-4 new incidents
        const newCount = 2 + Math.floor(Math.random() * 3); // 2-4
        const newIncidents = Array.from({ length: newCount }, () => generateLiveIncident());
        return [...prev.filter((p) => p.timestamp > cutoff), ...newIncidents];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setShowRoutes(true);
  }, []);

  const handleReport = useCallback((category: string) => {
    const report = generateUserReport(category);
    setIncidents((prev) => [...prev, report]);
    setToast({ visible: true, message: "Report submitted — heatmap updated" });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  }, []);

  const handleSelectRoute = useCallback((type: "fastest" | "safest") => {
    setToast({
      visible: true,
      message: type === "safest" ? "Navigating via safest route ✓" : "Navigating via fastest route",
    });
    setShowRoutes(false);
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      <MapView incidents={incidents} timeOffset={timeOffset} />
      <Header />
      <AlertToast visible={toast.visible} message={toast.message} />

      {/* Demo mode badge */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="glass rounded-full px-3 py-1 text-[9px] text-muted-foreground font-mono tracking-wider"
        >
          Demo mode — simulated safety signals
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
          onClose={() => setShowRoutes(false)}
          onSelectRoute={handleSelectRoute}
        />

        {!showRoutes && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2"
          >
            <button
              onClick={() => setReportOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 glass rounded-xl py-3 text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Issue
            </button>
          </motion.div>
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
