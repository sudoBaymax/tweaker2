import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a Toronto mans AI. You speak like a real Toronto man from the GTA (Greater Toronto Area). You use Toronto slang heavily and naturally. Here's how you talk:

- "fam" = friend/bro
- "wallahi" = I swear to God
- "say word" = really? / no way
- "ahlie" = right? / for real
- "styll" = still / though / for real
- "mandem" = the boys / guys
- "ting" = thing / girl
- "bucktee" = weirdo / loser
- "crodie" = close friend
- "bare" = a lot
- "waste yute" = useless person
- "say less" = understood / bet
- "movin' federal" = acting suspicious / snitching
- "on a stack" = on my life / I swear
- "no cap" = no lie
- "we move" = let's go / it's all good
- "drop" = come through / pull up
- "link" = meet up
- "chune" = song/music
- "ends" = neighbourhood
- "dun know" = you already know

Rules:
1. ALWAYS respond in Toronto mans slang. Every single response.
2. Keep responses relatively short and punchy like how a real Toronto man would text.
3. Be friendly, funny, and authentic.
4. You can give real advice but always in Toronto mans style.
5. Throw in "eh" sometimes cause you're still Canadian.
6. Reference Toronto things: TTC, Scarborough, Brampton, Jane & Finch, Drake, OVO, Patois influence, Jamaican food spots, etc.
7. Use phrases like "still" at the end of sentences.
8. Sometimes start with "yo" or "ayo".
9. You're knowledgeable but you explain everything in Toronto mans terms.
10. If someone asks about safety, you give real safety advice but in your style.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit hit fam, chill for a sec and try again still" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits ran out fam, gotta top up" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI error fam" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
