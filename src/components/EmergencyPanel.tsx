import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Share2, ShieldAlert, X, MessageSquare, Copy, Check } from "lucide-react";

const EMERGENCY_NUMBER = "6478700071";

const EmergencyPanel = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleCall911 = () => {
    window.location.href = `tel:${EMERGENCY_NUMBER}`;
  };

  const handleShareLocation = async () => {
    setSharing(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
      );
      const { latitude, longitude } = position.coords;
      const mapsUrl = `https://maps.google.com/maps?q=${latitude},${longitude}`;
      const message = `🚨 EMERGENCY — I need help! My current location: ${mapsUrl}`;

      if (navigator.share) {
        await navigator.share({ title: "Emergency Location", text: message, url: mapsUrl });
      } else {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback: copy a generic message
      const fallback = `🚨 EMERGENCY — I need help! Please call me at this number.`;
      await navigator.clipboard.writeText(fallback);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
    setSharing(false);
  };

  const handleTextEmergency = () => {
    const body = encodeURIComponent("🚨 EMERGENCY — I need help! Please check my location.");
    window.location.href = `sms:${EMERGENCY_NUMBER}?body=${body}`;
  };

  return (
    <>
      {/* Floating SOS button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        onClick={() => setOpen(!open)}
        className="absolute top-12 right-3 z-30 w-11 h-11 flex items-center justify-center bg-destructive text-destructive-foreground font-black text-xs tracking-wider border-2 border-destructive/60 shadow-lg hover:scale-105 active:scale-95 transition-transform"
        title="Emergency"
      >
        {open ? <X className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
      </motion.button>

      {/* Emergency panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-24 right-3 z-30 w-64 glass border border-border p-3 flex flex-col gap-2"
          >
            <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase text-center mb-1">
              EMERGENCY ACTIONS
            </p>

            {/* Call button */}
            <button
              onClick={handleCall911}
              className="flex items-center gap-2 w-full py-2.5 px-3 bg-destructive text-destructive-foreground font-bold text-xs uppercase tracking-wider hover:bg-destructive/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              CALL EMERGENCY
            </button>

            {/* Text emergency */}
            <button
              onClick={handleTextEmergency}
              className="flex items-center gap-2 w-full py-2.5 px-3 bg-secondary text-secondary-foreground font-bold text-xs uppercase tracking-wider hover:bg-secondary/80 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              TEXT EMERGENCY
            </button>

            {/* Share location */}
            <button
              onClick={handleShareLocation}
              disabled={sharing}
              className="flex items-center gap-2 w-full py-2.5 px-3 bg-accent text-accent-foreground font-bold text-xs uppercase tracking-wider hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  LOCATION COPIED
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  {sharing ? "GETTING LOCATION..." : "SHARE LOCATION"}
                </>
              )}
            </button>

            <p className="text-[9px] text-muted-foreground text-center mt-1">
              Shares your GPS coordinates with emergency contacts
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmergencyPanel;
