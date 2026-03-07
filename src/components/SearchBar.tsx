import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Navigation, Circle } from "lucide-react";

interface SearchBarProps {
  onSearch: (from: string, to: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [from, setFrom] = useState("Current Location");
  const [to, setTo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (to.trim()) onSearch(from.trim(), to.trim());
  };

  return (
    <motion.form
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15 }}
      onSubmit={handleSubmit}
      className="relative w-full"
    >
      <div className="glass p-3">
        {/* From field */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center w-5 flex-shrink-0">
            <Navigation className="w-4 h-4 text-primary" />
          </div>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Starting location"
            className="bg-transparent outline-none text-sm font-bold text-foreground placeholder:text-muted-foreground flex-1 uppercase tracking-wide"
          />
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors flex-shrink-0 font-bold uppercase"
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">GPS</span>
          </button>
        </div>

        {/* Connector line */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex flex-col items-center w-5 flex-shrink-0">
            <div className="w-0.5 h-6 bg-border" />
          </div>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* To field */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center w-5 flex-shrink-0">
            <Circle className="w-4 h-4 text-danger" />
          </div>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="DESTINATION"
            className="bg-transparent outline-none text-sm font-bold text-foreground placeholder:text-muted-foreground flex-1 uppercase tracking-wide"
          />
          <button
            type="submit"
            className="flex items-center gap-1 text-sm text-foreground bg-primary text-primary-foreground px-3 py-1.5 font-bold uppercase tracking-wider hover:bg-primary/90"
          >
            <Search className="w-4 h-4" />
            GO
          </button>
        </div>
      </div>
    </motion.form>
  );
};

export default SearchBar;
