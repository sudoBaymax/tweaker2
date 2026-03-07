import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface TimelineSliderProps {
  value: number;
  onChange: (value: number) => void;
}

function formatLabel(hoursOffset: number): string {
  const date = new Date(Date.now() + hoursOffset * 60 * 60 * 1000);
  const h = date.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  if (hoursOffset === 0) return "NOW";
  return `${h12}${ampm}`;
}

const TimelineSlider = ({ value, onChange }: TimelineSliderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass px-3 py-1.5"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Timeline</span>
        </div>
        <span className="text-xs font-mono font-bold text-primary uppercase">
          {value === 0 ? "LIVE" : formatLabel(value)}
        </span>
      </div>
      <Slider
        min={-24}
        max={0}
        step={0.5}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-muted-foreground font-bold uppercase">24H AGO</span>
        <span className="text-[10px] text-primary font-bold uppercase">NOW</span>
      </div>
    </motion.div>
  );
};

export default TimelineSlider;
