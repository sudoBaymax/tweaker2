import { motion } from "framer-motion";

const SafetyLegend = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex items-center gap-4 glass px-4 py-2"
    >
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-safe" />
        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Safe</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-warning" />
        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Caution</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-danger" />
        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Risky</span>
      </div>
    </motion.div>
  );
};

export default SafetyLegend;
