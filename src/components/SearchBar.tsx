import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Navigation, Circle } from "lucide-react";
import { KNOWN_DESTINATIONS } from "@/lib/routing";

interface SearchBarProps {
  onSearch: (from: string, to: string) => void;
}

const DESTINATION_NAMES = Object.keys(KNOWN_DESTINATIONS).map(
  (name) => name.replace(/\b\w/g, (c) => c.toUpperCase())
);

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [from, setFrom] = useState("Current Location");
  const [to, setTo] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToChange = (value: string) => {
    setTo(value);
    setSelectedIndex(-1);
    if (value.trim().length > 0) {
      const q = value.toLowerCase();
      const matches = DESTINATION_NAMES.filter((name) =>
        name.toLowerCase().includes(q)
      ).slice(0, 6);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (name: string) => {
    setTo(name);
    setShowSuggestions(false);
    onSearch(from.trim(), name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[selectedIndex]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (to.trim()) {
      setShowSuggestions(false);
      onSearch(from.trim(), to.trim());
    }
  };

  return (
    <motion.form
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15 }}
      onSubmit={handleSubmit}
      className="relative w-full"
      ref={wrapperRef}
    >
      <div className="glass p-2">
        {/* From field */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center w-4 flex-shrink-0">
            <Navigation className="w-3 h-3 text-primary" />
          </div>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Starting location"
            className="bg-transparent outline-none text-xs font-bold text-foreground placeholder:text-muted-foreground flex-1 uppercase tracking-wide"
          />
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors flex-shrink-0 font-bold uppercase"
          >
            <MapPin className="w-3 h-3" />
            <span className="hidden sm:inline">GPS</span>
          </button>
        </div>

        {/* Connector line */}
        <div className="flex items-center gap-2 py-0.5">
          <div className="flex flex-col items-center w-4 flex-shrink-0">
            <div className="w-0.5 h-4 bg-border" />
          </div>
          <div className="flex-1 border-t border-border" />
        </div>

        {/* To field */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center w-4 flex-shrink-0">
            <Circle className="w-3 h-3 text-danger" />
          </div>
          <input
            type="text"
            value={to}
            onChange={(e) => handleToChange(e.target.value)}
            onFocus={() => to.trim() && suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="DESTINATION"
            className="bg-transparent outline-none text-xs font-bold text-foreground placeholder:text-muted-foreground flex-1 uppercase tracking-wide"
            autoComplete="off"
          />
          <button
            type="submit"
            className="flex items-center gap-1 text-xs text-foreground bg-primary text-primary-foreground px-2.5 py-1 font-bold uppercase tracking-wider hover:bg-primary/90"
          >
            <Search className="w-3 h-3" />
            GO
          </button>
        </div>
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full mt-1 glass overflow-hidden z-50"
          >
            {suggestions.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => selectSuggestion(name)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-left transition-colors ${
                  i === selectedIndex
                    ? "bg-primary/20 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                {name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
};

export default SearchBar;
