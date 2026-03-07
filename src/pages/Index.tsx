import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import SearchBar from "@/components/SearchBar";
import RouteCard from "@/components/RouteCard";
import ReportModal from "@/components/ReportModal";
import AlertToast from "@/components/AlertToast";
import SafetyLegend from "@/components/SafetyLegend";
import { generateRandomReport, SafetyPoint } from "@/data/safetyData";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const Index = () => {
  const [showRoutes, setShowRoutes] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [newReports, setNewReports] = useState<SafetyPoint[]>([]);
  const [toast, setToast] = useState({ visible: false, message: "" });

  // "Alive map" — add random reports every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNewReports((prev) => [...prev, generateRandomReport()]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setShowRoutes(true);
  }, []);

  const handleReport = useCallback((category: string) => {
    const report = generateRandomReport();
    report.category = category;
    report.risk = 0.85 + Math.random() * 0.15; // High risk for user reports
    setNewReports((prev) => [...prev, report]);
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
      {/* Map */}
      <MapView newReports={newReports} />

      {/* Header */}
      <Header />

      {/* Toast */}
      <AlertToast visible={toast.visible} message={toast.message} />

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 flex flex-col gap-3 max-w-lg mx-auto">
        {/* Legend */}
        <div className="flex justify-center">
          <SafetyLegend />
        </div>

        {/* Search */}
        <SearchBar onSearch={handleSearch} />

        {/* Route Comparison */}
        <RouteCard
          visible={showRoutes}
          onClose={() => setShowRoutes(false)}
          onSelectRoute={handleSelectRoute}
        />

        {/* Action Buttons */}
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

      {/* Report Modal */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
      />
    </div>
  );
};

export default Index;
