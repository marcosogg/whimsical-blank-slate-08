import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    const url = new URL(req.url);
    const pathname = url.pathname;


    if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  //  Handle image analysis request
  if (pathname === '/analyze-image') {
      try {
        const { image } = await req.json();

      if (!image) {
        console.error('No image URL provided in request body');
        return new Response(
            JSON.stringify({ error: 'No image URL provided' }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
      }

      console.log('Processing image URL:', image);

      // Initialize Supabase client
      const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const openai = new OpenAI({
          apiKey: Deno.env.get('OPENAI_API_KEY'),
      });

      console.log('Calling OpenAI API...');
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
                      {
                          type: "text",
                          text: "Analyze this image and provide word definitions and sample sentences."
                      },
                      {
                          type: "image_url",
                          image_url: {
                              url: image,
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


      // Store results in the database
      const { error: dbError } = await supabase
          .from('image_analysis')
          .insert({
              image_path: image,
              analysis_data: analysisData
          });

      if (dbError) {
          console.error('Database error:', dbError);
          throw new Error('Failed to save analysis results');
      }

      // Store word analyses
      const wordPromises = analysisData.map((item: any) =>
          supabase.from('word_analyses').insert({
              word: item.word,
              definition: item.definition,
              sample_sentence: item.sampleSentence
          })
      );

      await Promise.all(wordPromises);

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
   }
  // Handle audio generation request
    if (pathname === '/generate-audio') {
         try {
            const { text } = await req.json();
             if (!text) {
                console.error('No text provided in request body');
                return new Response(
                    JSON.stringify({ error: 'No text provided' }),
                    {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                );
            }


           const openai = new OpenAI({
                apiKey: Deno.env.get('OPENAI_API_KEY'),
            });

             const response = await openai.audio.speech.create({
                  model: "tts-1",
                  input: text,
                  voice: "alloy",
            });

              const buffer = await response.arrayBuffer();

               return new Response(buffer,{
                   headers: {
                        ...corsHeaders,
                        'Content-Type': 'audio/mpeg',
                   }
               });


        } catch (error) {
             console.error('Error generating audio:', error);
           return new Response(
                JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
        }
    }
});
