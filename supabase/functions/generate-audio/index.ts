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

    const formats = ['mp3', 'opus'];
    let audioData;
    let currentFormat;
    let error;

    // Try different audio formats
    for (const format of formats) {
      try {
        console.log(`Attempting to generate audio in ${format} format`);
        const response = await openai.audio.speech.create({
          model: "tts-1",
          voice: "alloy",
          input: text,
          response_format: format,
        });

        console.log('OpenAI API response received successfully');
        audioData = await response.arrayBuffer();
        currentFormat = format;
        console.log(`Successfully generated ${format} audio. Size: ${audioData.byteLength} bytes`);
        break;
      } catch (e) {
        console.error(`Error generating ${format} audio:`, e);
        error = e;
      }
    }

    if (!audioData) {
      throw error || new Error('Failed to generate audio in any format');
    }

    // Set content type based on the successful format
    const contentType = currentFormat === 'mp3' ? 'audio/mpeg' : 'audio/opus';
    
    // Set all necessary headers for audio streaming
    const headers = {
      ...corsHeaders,
      'Content-Type': contentType,
      'Content-Length': audioData.byteLength.toString(),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
    };

    console.log('Sending response with headers:', headers);
    console.log(`Final audio buffer size: ${audioData.byteLength} bytes`);

    return new Response(audioData, { headers });

  } catch (error) {
    console.error('Error in generate-audio function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
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