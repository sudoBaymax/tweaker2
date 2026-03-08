

## Plan: Update ElevenLabs API Key and Verify

The API key has been updated on ElevenLabs with **ElevenAgents Write** permission enabled. Now I need to:

1. **Update the `ELEVENLABS_API_KEY` secret** with the new key value so the edge function can authenticate properly
2. **Test the edge function** to confirm the 401 error is resolved

No code changes are needed — the edge function and component code are already correct. This is purely a secret update + verification step.

