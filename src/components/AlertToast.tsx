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
          className="fixed top-16 left-1/2 -translate-x-1/2 z-30 glass px-4 py-3 flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm text-foreground font-bold uppercase tracking-wider">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertToast;
