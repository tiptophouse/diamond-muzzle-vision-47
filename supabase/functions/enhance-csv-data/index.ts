import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { sampleData, validShapes, validColors, validClarities, validCuts } = await req.json();

    const prompt = `You are a diamond industry expert helping to clean CSV data for a diamond inventory system.

Given this sample CSV data:
${JSON.stringify(sampleData, null, 2)}

Please analyze and provide mappings for any invalid values to match these valid options:

Valid Shapes: ${validShapes.join(', ')}
Valid Colors: ${validColors.join(', ')}  
Valid Clarities: ${validClarities.join(', ')}
Valid Cuts: ${validCuts.join(', ')}

For each invalid value you find, provide a mapping in this JSON format:
[
  {
    "originalValue": "round",
    "enhancedValue": "round brilliant", 
    "field": "shape",
    "confidence": 0.95
  }
]

Focus on:
1. Shape: Map "round" to "round brilliant", "RD" to "round brilliant", etc.
2. Color: Only accept D-N, convert any other values to closest valid grade
3. Clarity: Map to standard GIA clarity grades
4. Cut: Map to standard cut grades

Return only the JSON array of mappings, no explanation text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a diamond industry data cleaning expert. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1000
      }),
    });

    const aiResponse = await response.json();
    
    if (aiResponse.choices && aiResponse.choices[0]) {
      const content = aiResponse.choices[0].message.content.trim();
      
      try {
        // Parse the JSON response from OpenAI
        const mappings = JSON.parse(content);
        
        console.log('✅ OpenAI CSV enhancement successful:', mappings);
        
        return new Response(JSON.stringify(mappings), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content);
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify([]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhance-csv-data function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to enhance CSV data' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});