import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      throw new Error('No image URL provided');
    }

    console.log('Processing image URL:', imageUrl);

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a visual dictionary assistant. Analyze the image and identify 3-4 key words or concepts. For each word, provide its definition and a sample sentence. Format your response as a JSON array of objects, each containing 'word', 'definition', and 'sampleSentence' fields."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and provide word definitions and sample sentences."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const content = completion.choices[0].message.content;
    console.log('Raw GPT response:', content);

    let analysisData;
    try {
      analysisData = JSON.parse(content.replace(/```json\s?|\s?```/g, '').trim());
      console.log('Parsed analysis data:', analysisData);
    } catch (parseError) {
      console.error('Failed to parse GPT response:', parseError);
      throw new Error('Failed to parse analysis results');
    }

    return new Response(
      JSON.stringify({ analysis: analysisData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});