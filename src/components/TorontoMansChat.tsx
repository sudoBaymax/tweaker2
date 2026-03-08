import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Mic, MicOff, Loader2, Phone, PhoneOff } from "lucide-react";
import { useConversation } from "@elevenlabs/react";
import { supabase } from "@/integrations/supabase/client";

type TranscriptEntry = {
  role: "user" | "agent";
  text: string;
};

export default function TorontoMansChat() {
  const [open, setOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to Toronto Mans agent");
      setError(null);
    },
    onDisconnect: () => {
      console.log("Disconnected from Toronto Mans agent");
    },
    onMessage: (message: any) => {
      if (message.type === "user_transcript") {
        const transcript = message.user_transcription_event?.user_transcript;
        if (transcript) {
          setTranscripts((prev) => [...prev, { role: "user", text: transcript }]);
        }
      } else if (message.type === "agent_response") {
        const response = message.agent_response_event?.agent_response;
        if (response) {
          setTranscripts((prev) => [...prev, { role: "agent", text: response }]);
        }
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      setError("Connection error — try again fam");
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcripts]);

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const { data, error: fnError } = await supabase.functions.invoke(
        "elevenlabs-conversation-token"
      );

      if (fnError || !data?.token) {
        throw new Error(fnError?.message || "No token received");
      }

      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
      });
    } catch (err) {
      console.error("Failed to start conversation:", err);
      setError(
        err instanceof Error && err.message.includes("Permission")
          ? "Mic access needed fam — enable it in your browser"
          : "Couldn't connect still, try again eh"
      );
    } finally {
      setIsConnecting(false);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 right-3 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
            aria-label="Open Toronto Mans Chat"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-3 right-3 z-40 w-[340px] h-[480px] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
              <div>
                <p className="font-bold text-sm tracking-wide">TORONTO MANS 🇨🇦</p>
                <p className="text-[10px] opacity-80 font-mono">
                  {isConnected
                    ? isSpeaking
                      ? "speaking..."
                      : "listening..."
                    : "tap to link up fam"}
                </p>
              </div>
              <button
                onClick={() => {
                  if (isConnected) stopConversation();
                  setOpen(false);
                }}
                className="hover:bg-primary-foreground/20 rounded-full p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Transcripts */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
              {transcripts.length === 0 && !isConnected && (
                <div className="text-center text-muted-foreground text-xs mt-8 space-y-2">
                  <p className="text-2xl">🍁</p>
                  <p className="font-bold">Yo what's good fam!</p>
                  <p>Hit that call button and talk to the mandem styll</p>
                </div>
              )}

              {transcripts.length === 0 && isConnected && (
                <div className="text-center text-muted-foreground text-xs mt-8 space-y-2">
                  <p className="text-2xl">🎤</p>
                  <p className="font-bold">We're linked up!</p>
                  <p>Go ahead and say something fam</p>
                </div>
              )}

              {transcripts.map((t, i) => (
                <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      t.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {t.text}
                  </div>
                </div>
              ))}

              {isConnected && isSpeaking && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-border flex flex-col items-center gap-2">
              {error && (
                <p className="text-[10px] text-destructive text-center">{error}</p>
              )}

              {!isConnected ? (
                <button
                  onClick={startConversation}
                  disabled={isConnecting}
                  className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg"
                >
                  {isConnecting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Phone className="w-6 h-6" />
                  )}
                </button>
              ) : (
                <button
                  onClick={stopConversation}
                  className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-lg animate-pulse"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              )}

              <p className="text-[10px] text-muted-foreground">
                {isConnecting
                  ? "linking up..."
                  : isConnected
                  ? "tap to end call"
                  : "tap to call the mandem"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
