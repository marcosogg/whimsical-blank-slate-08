import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image URL provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You are a visual dictionary assistant for English learners. Analyze the image and identify 3-4 key words or concepts. For each word, provide its definition using simple, basic English. Also, provide a sample sentence using very common scenarios and simple vocabulary. Format your response as a JSON array of objects, each containing 'word', 'definition', and 'sampleSentence' fields."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and provide word definitions and sample sentences." },
            { type: "image_url", image_url: { url: image, detail: "high" } }
          ]
        }
      ],
      max_tokens: 1000
    });

    const content = completion.choices[0].message.content;
    console.log('Raw GPT response:', content);

    let analysisData = JSON.parse(content.replace(/```json\s?|\s?```/g, '').trim());

    // Store results in the database
    await supabase.from('image_analysis').insert({ image_path: image, analysis_data: analysisData });

    // Store word analyses
    await Promise.all(analysisData.map((item: any) => 
      supabase.from('word_analyses').insert({
        word: item.word,
        definition: item.definition,
        sample_sentence: item.sampleSentence
      })
    ));

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
