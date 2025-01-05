import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      console.error('Invalid or missing text input:', text);
      return new Response(
        JSON.stringify({ error: 'Invalid or missing text input' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Generating audio for text: "${text}"`);

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

    console.log(`Successfully generated MP3 audio. Size: ${audioData.byteLength} bytes`);

    return new Response(audioData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioData.byteLength.toString(),
      }
    });

  } catch (error) {
    console.error('Error in generate-audio function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate audio',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});