import { motion, AnimatePresence } from "framer-motion";
import { Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

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

      <AnimatePresence mode="wait">
        {loading ? null : user ? (
          <motion.div
            key="user"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2"
          >
            <Avatar className="h-7 w-7 border border-primary/40">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="signin"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={signInWithGoogle}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 border border-border hover:border-primary font-bold uppercase tracking-wider"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign In
          </motion.button>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
