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
              <p className="text-2xl font-bold text-foreground">8 MIN</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase">Normal risk</p>
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
              <p className="text-2xl font-bold text-foreground">10 MIN</p>
              <p className="text-xs text-primary/70 mt-1 uppercase">Low risk</p>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RouteCard;
