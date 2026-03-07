import { motion } from "framer-motion";

const SafetyLegend = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex items-center gap-3 glass px-3 py-1"
    >
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-safe" />
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Safe</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-warning" />
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Caution</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-danger" />
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Risky</span>
      </div>
    </motion.div>
  );
};

export default SafetyLegend;
