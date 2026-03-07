import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Lightbulb, ShieldOff, UserX, Send } from "lucide-react";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (category: string, intensity: number) => void;
}

const intensityLevels = [
  { id: "low", label: "LOW", color: "bg-safe", value: 0.3 },
  { id: "medium", label: "MED", color: "bg-warning", value: 0.6 },
  { id: "high", label: "HIGH", color: "bg-danger", value: 1.0 },
];

const categories = [
  { id: "suspicious_activity", label: "SUSPICIOUS ACTIVITY", icon: AlertTriangle, emoji: "⚠️" },
  { id: "poor_lighting", label: "POOR LIGHTING", icon: Lightbulb, emoji: "💡" },
  { id: "harassment", label: "HARASSMENT", icon: ShieldOff, emoji: "🚫" },
  { id: "unsafe_area", label: "UNSAFE AREA", icon: UserX, emoji: "🚷" },
];

const ReportModal = ({ open, onClose, onSubmit }: ReportModalProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (!selected) return;
    onSubmit(selected);
    setSelected(null);
    setComment("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/80"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass p-5 max-w-lg mx-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">Report Issue</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">
              Select the type of safety concern
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelected(cat.id)}
                  className={`flex items-center gap-2 p-3 border-2 text-left text-sm font-bold transition-colors ${
                    selected === cat.id
                      ? "border-danger bg-danger/10 text-danger"
                      : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-base">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="ADD A COMMENT (OPTIONAL)"
              className="w-full bg-secondary/50 border-2 border-border p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none h-16 mb-4 uppercase"
            />

            <button
              onClick={handleSubmit}
              disabled={!selected}
              className={`w-full flex items-center justify-center gap-2 py-3 text-base font-bold uppercase tracking-wider transition-colors ${
                selected
                  ? "bg-danger text-destructive-foreground hover:bg-danger/90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Send className="w-5 h-5" />
              SUBMIT REPORT
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
