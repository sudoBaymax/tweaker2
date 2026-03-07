import { motion, AnimatePresence } from "framer-motion";
import { Clock, Shield, Star, X } from "lucide-react";
import { RouteResult } from "@/lib/routing";

interface RouteCardProps {
  visible: boolean;
  onClose: () => void;
  onSelectRoute: (type: "fastest" | "safest") => void;
  fastest?: RouteResult | null;
  safest?: RouteResult | null;
}

function riskLabel(score: number): string {
  if (score < 0.15) return "LOW RISK";
  if (score < 0.35) return "MODERATE RISK";
  if (score < 0.55) return "ELEVATED RISK";
  return "HIGH RISK";
}

function riskColor(score: number): string {
  if (score < 0.15) return "text-safe";
  if (score < 0.35) return "text-primary";
  if (score < 0.55) return "text-warning";
  return "text-danger";
}

const RouteCard = ({ visible, onClose, onSelectRoute, fastest, safest }: RouteCardProps) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="glass p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-foreground uppercase tracking-wider">Choose Route</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onSelectRoute("fastest")}
              className="border-2 border-border p-4 text-left hover:border-accent transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-accent uppercase">Fastest</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {fastest ? `${fastest.walkMinutes} MIN` : "— MIN"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 uppercase">
                {fastest ? `${fastest.distanceKm.toFixed(1)} km` : "—"}
              </p>
              <p className={`text-xs mt-1 uppercase font-bold ${fastest ? riskColor(fastest.riskScore) : "text-muted-foreground"}`}>
                {fastest ? riskLabel(fastest.riskScore) : "—"}
              </p>
            </button>

            <button
              onClick={() => onSelectRoute("safest")}
              className="border-2 border-primary/40 p-4 text-left hover:border-primary bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary uppercase">Safest</span>
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {safest ? `${safest.walkMinutes} MIN` : "— MIN"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 uppercase">
                {safest ? `${safest.distanceKm.toFixed(1)} km` : "—"}
              </p>
              <p className={`text-xs mt-1 uppercase font-bold ${safest ? riskColor(safest.riskScore) : "text-muted-foreground"}`}>
                {safest ? riskLabel(safest.riskScore) : "—"}
              </p>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RouteCard;
