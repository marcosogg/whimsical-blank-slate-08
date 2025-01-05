import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl } = await req.json()
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'No image URL provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Processing image URL:', imageUrl)

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI that analyzes images and identifies key words, providing their definitions and example sentences. Format your response as a JSON array of objects, each containing 'word', 'definition', and 'sampleSentence' fields."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and identify key words. For each word, provide its definition and a sample sentence. Return the response as a JSON array."
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
    })

    const content = completion.choices[0].message.content
    console.log('Raw GPT response:', content)

    let analysisData
    try {
      analysisData = JSON.parse(content.replace(/```json\s?|\s?```/g, '').trim())
      console.log('Parsed analysis data:', analysisData)
    } catch (parseError) {
      console.error('Failed to parse GPT response:', parseError)
      throw new Error('Failed to parse analysis results')
    }

    // Store results in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: dbError } = await supabase
      .from('image_analysis')
      .insert({
        image_path: imageUrl,
        analysis_data: analysisData
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save analysis results')
    }

    return new Response(
      JSON.stringify({ analysis: analysisData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in analyze-image function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})