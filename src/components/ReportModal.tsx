import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Lightbulb, ShieldOff, UserX, Send } from "lucide-react";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (category: string) => void;
}

const categories = [
  { id: "suspicious_activity", label: "Suspicious Activity", icon: AlertTriangle, emoji: "⚠️" },
  { id: "poor_lighting", label: "Poor Lighting", icon: Lightbulb, emoji: "💡" },
  { id: "harassment", label: "Harassment", icon: ShieldOff, emoji: "🚫" },
  { id: "unsafe_area", label: "Unsafe Area", icon: UserX, emoji: "🚷" },
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass rounded-t-2xl p-5 max-w-lg mx-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Report Issue</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Select the type of safety concern
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelected(cat.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left text-xs font-medium transition-all duration-200 ${
                    selected === cat.id
                      ? "border-danger/60 bg-danger/10 text-danger shadow-[var(--glow-danger)]"
                      : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                  }`}
                >
                  <span className="text-sm">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)"
              className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30 resize-none h-16 mb-4"
            />

            <button
              onClick={handleSubmit}
              disabled={!selected}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                selected
                  ? "bg-danger text-destructive-foreground hover:bg-danger/90 shadow-[var(--glow-danger)]"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              Submit Report
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
