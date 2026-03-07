import { motion, AnimatePresence } from "framer-motion";
import { Clock, Shield, Star, X } from "lucide-react";

interface RouteCardProps {
  visible: boolean;
  onClose: () => void;
  onSelectRoute: (type: "fastest" | "safest") => void;
}

const RouteCard = ({ visible, onClose, onSelectRoute }: RouteCardProps) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Choose Route</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Fastest Route */}
            <button
              onClick={() => onSelectRoute("fastest")}
              className="group relative rounded-lg border border-border p-3 text-left hover:border-accent/50 transition-all duration-200 hover:shadow-[var(--glow-warning)]"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium text-accent">Fastest</span>
              </div>
              <p className="text-lg font-bold text-foreground">8 min</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Normal risk</p>
            </button>

            {/* Safest Route */}
            <button
              onClick={() => onSelectRoute("safest")}
              className="group relative rounded-lg border border-primary/30 p-3 text-left hover:border-primary/60 transition-all duration-200 hover:shadow-[var(--glow-safe)] bg-primary/5"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Safest</span>
                <Star className="w-3 h-3 text-primary fill-primary" />
              </div>
              <p className="text-lg font-bold text-foreground">10 min</p>
              <p className="text-[10px] text-primary/70 mt-0.5">Low risk</p>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RouteCard;
