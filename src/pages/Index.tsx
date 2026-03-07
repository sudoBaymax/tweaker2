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

  const handleSearch = useCallback((from: string, to: string) => {
    setShowRoutes(true);
  }, []);

  const handleReport = useCallback((category: string) => {
    const report = generateUserReport(category);
    setIncidents((prev) => [...prev, report]);
    setToast({ visible: true, message: "REPORT SUBMITTED — HEATMAP UPDATED" });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  }, []);

  const handleSelectRoute = useCallback((type: "fastest" | "safest") => {
    setToast({
      visible: true,
      message: type === "safest" ? "NAVIGATING VIA SAFEST ROUTE ✓" : "NAVIGATING VIA FASTEST ROUTE",
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
          transition={{ delay: 0.5 }}
          className="glass px-4 py-2 text-xs text-muted-foreground font-mono tracking-widest uppercase"
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
          onClose={() => setShowRoutes(false)}
          onSelectRoute={handleSelectRoute}
        />

        {!showRoutes && (
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
