import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="absolute top-0 left-0 right-0 z-20 glass px-4 py-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 flex items-center justify-center border-2 border-primary/40">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-widest text-foreground">
            TWEAKER AI
          </h1>
          <p className="text-xs text-muted-foreground leading-none uppercase tracking-wider">
            Real-time urban safety signals
          </p>
        </div>
      </div>
      <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 border-2 border-border hover:border-primary font-bold uppercase tracking-wider">
        Sign In
      </button>
    </motion.header>
  );
};

export default Header;
