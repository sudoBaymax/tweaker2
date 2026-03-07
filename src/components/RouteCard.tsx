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
          className="glass p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Choose Route</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectRoute("fastest")}
              className="border border-border p-3 text-left hover:border-accent transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-bold text-accent uppercase">Fastest</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {fastest ? `${fastest.walkMinutes} MIN` : "— MIN"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">
                {fastest ? `${fastest.distanceKm.toFixed(1)} km` : "—"}
              </p>
              <p className={`text-[10px] mt-0.5 uppercase font-bold ${fastest ? riskColor(fastest.riskScore) : "text-muted-foreground"}`}>
                {fastest ? riskLabel(fastest.riskScore) : "—"}
              </p>
            </button>

            <button
              onClick={() => onSelectRoute("safest")}
              className="border border-primary/40 p-3 text-left hover:border-primary bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-primary uppercase">Safest</span>
                <Star className="w-3 h-3 text-primary fill-primary" />
              </div>
              <p className="text-xl font-bold text-foreground">
                {safest ? `${safest.walkMinutes} MIN` : "— MIN"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">
                {safest ? `${safest.distanceKm.toFixed(1)} km` : "—"}
              </p>
              <p className={`text-[10px] mt-0.5 uppercase font-bold ${safest ? riskColor(safest.riskScore) : "text-muted-foreground"}`}>
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
