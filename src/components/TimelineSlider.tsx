import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface TimelineSliderProps {
  value: number; // 0 to 24 (hours from now, negative = past)
  onChange: (value: number) => void;
}

function formatLabel(hoursOffset: number): string {
  const date = new Date(Date.now() + hoursOffset * 60 * 60 * 1000);
  const h = date.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  if (hoursOffset === 0) return "Now";
  return `${h12}${ampm}`;
}

const TimelineSlider = ({ value, onChange }: TimelineSliderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="glass rounded-xl px-4 py-3"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Timeline</span>
        </div>
        <span className="text-xs font-mono text-primary">
          {value === 0 ? "Live" : formatLabel(value)}
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
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-muted-foreground">24h ago</span>
        <span className="text-[9px] text-primary font-medium">Now</span>
      </div>
    </motion.div>
  );
};

export default TimelineSlider;
