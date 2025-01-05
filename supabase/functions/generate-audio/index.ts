import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      console.error('[generate-audio] Invalid or missing text input:', text);
      return new Response(
        JSON.stringify({ error: 'Invalid or missing text input' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[generate-audio] Generating audio for text: "${text}"`);

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
      response_format: 'mp3',
    });

    if (!response) {
      throw new Error('Failed to generate audio: No response from OpenAI');
    }

    const audioData = await response.arrayBuffer();
    
    if (!audioData || audioData.byteLength === 0) {
      throw new Error('Failed to generate audio: Empty audio data received');
    }

    console.log(`[generate-audio] Generated audio data. Size: ${audioData.byteLength} bytes`);
    console.log('[generate-audio] Audio data type:', Object.prototype.toString.call(audioData));

    return new Response(audioData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioData.byteLength.toString(),
      }
    });

  } catch (error) {
    console.error('[generate-audio] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});