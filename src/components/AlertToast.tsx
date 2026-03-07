import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface AlertToastProps {
  visible: boolean;
  message: string;
}

const AlertToast = ({ visible, message }: AlertToastProps) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="fixed top-12 left-1/2 -translate-x-1/2 z-30 glass px-3 py-1.5 flex items-center gap-1.5"
        >
          <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <p className="text-xs text-foreground font-bold uppercase tracking-wider">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertToast;
