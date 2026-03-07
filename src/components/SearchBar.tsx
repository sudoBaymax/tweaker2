import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <motion.form
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onSubmit={handleSubmit}
      className="relative w-full"
    >
      <div
        className={`glass rounded-xl flex items-center gap-3 px-4 py-3 transition-all duration-300 ${
          isFocused ? "ring-1 ring-primary/50 shadow-[var(--glow-safe)]" : ""
        }`}
      >
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="Search destination…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground flex-1"
        />
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors flex-shrink-0"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Location</span>
        </button>
      </div>
    </motion.form>
  );
};

export default SearchBar;
