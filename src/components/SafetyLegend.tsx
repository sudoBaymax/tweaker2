import { motion } from "framer-motion";

const SafetyLegend = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="flex items-center gap-3 glass rounded-lg px-3 py-2"
    >
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-safe shadow-[var(--glow-safe)]" />
        <span className="text-[10px] text-muted-foreground">Safe</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-warning shadow-[var(--glow-warning)]" />
        <span className="text-[10px] text-muted-foreground">Caution</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-danger shadow-[var(--glow-danger)]" />
        <span className="text-[10px] text-muted-foreground">Risky</span>
      </div>
    </motion.div>
  );
};

export default SafetyLegend;
