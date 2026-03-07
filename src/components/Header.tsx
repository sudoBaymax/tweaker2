import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="absolute top-0 left-0 right-0 z-20 glass px-3 py-1.5 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-primary/20 flex items-center justify-center border border-primary/40">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-widest text-foreground leading-tight">
            TWEAKER AI
          </h1>
          <p className="text-[10px] text-muted-foreground leading-none uppercase tracking-wider">
            Real-time urban safety signals
          </p>
        </div>
      </div>
      <button className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 border border-border hover:border-primary font-bold uppercase tracking-wider">
        Sign In
      </button>
    </motion.header>
  );
};

export default Header;
