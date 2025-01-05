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

    if (!text) {
      console.error('No text provided for audio generation');
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Starting audio generation for text: "${text}"`);

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
      response_format: "mp3",
    });

    console.log('OpenAI API response received successfully');

    // Convert the response to ArrayBuffer
    const audioData = await response.arrayBuffer();
    console.log(`Audio data received. Size: ${audioData.byteLength} bytes`);

    // Set all necessary headers for audio streaming
    const headers = {
      ...corsHeaders,
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioData.byteLength.toString(),
      'Accept-Ranges': 'bytes',
    };

    console.log('Sending response with headers:', headers);

    return new Response(audioData, { headers });

  } catch (error) {
    console.error('Error in generate-audio function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Detailed error:', errorMessage);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.stack : 'No stack trace available'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});