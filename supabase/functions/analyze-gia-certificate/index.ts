
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 GIA CERTIFICATE ANALYZER: Function called');
    
    if (!openAIApiKey) {
      console.error('❌ Configuration Error: OPENAI_API_KEY is not set');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageData, extractAllData = true } = await req.json();
    
    if (!imageData) {
      return new Response(JSON.stringify({ 
        error: 'No image data provided',
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🤖 GIA ANALYZER: Processing GIA certificate image with GPT Vision');

    const systemPrompt = `You are a professional diamond grading expert analyzing GIA (Gemological Institute of America) certificates. 

Extract ALL the diamond information from this GIA certificate image and return it as a structured JSON object.

IMPORTANT: Extract the following data points if visible:
- Certificate/Report Number
- Shape (Round, Princess, Emerald, Asscher, Marquise, Oval, Radiant, Pear, Heart, Cushion)
- Carat Weight (exact decimal)
- Color Grade (D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z)
- Clarity Grade (FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2, SI3, I1, I2, I3)
- Cut Grade (Excellent, Very Good, Good, Fair, Poor) - for Round diamonds only
- Polish (Excellent, Very Good, Good, Fair, Poor)
- Symmetry (Excellent, Very Good, Good, Fair, Poor)
- Fluorescence (None, Faint, Medium, Strong, Very Strong) and color if specified
- Measurements (Length x Width x Depth in mm)
- Table % (if available)
- Depth % (if available)
- Girdle description
- Culet description
- Any inscriptions or laser inscriptions
- Comments section
- Lab (should be GIA)

Return ONLY a JSON object with this exact structure:
{
  "certificateNumber": "string",
  "shape": "string",
  "weight": number,
  "color": "string", 
  "clarity": "string",
  "cut": "string",
  "polish": "string",
  "symmetry": "string",
  "fluorescence": "string",
  "measurements": {
    "length": number,
    "width": number, 
    "depth": number
  },
  "tablePercentage": number,
  "depthPercentage": number,
  "girdle": "string",
  "culet": "string",
  "lab": "GIA",
  "inscriptions": "string",
  "comments": "string"
}

If any field cannot be determined from the image, use null for that field. Be precise with numerical values.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this GIA certificate and extract all the diamond data as structured JSON.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1,
      }),
    });
    
    console.log('🤖 GIA ANALYZER: OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ OpenAI API Error:', errorBody);
      throw new Error(`OpenAI API Error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('No response from OpenAI API');
    }

    console.log('🤖 GIA ANALYZER: Raw AI response:', aiResponse);

    // Parse the JSON response
    let diamondData;
    try {
      diamondData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError);
      // Try to extract JSON from response if it's wrapped in other text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        diamondData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI response is not valid JSON');
      }
    }

    // Validate and clean the extracted data
    const cleanedData = {
      stockNumber: diamondData.certificateNumber || `GIA-${Date.now()}`,
      certificateNumber: diamondData.certificateNumber || '',
      shape: diamondData.shape || 'Round',
      carat: diamondData.weight || 0,
      color: diamondData.color || 'G',
      clarity: diamondData.clarity || 'VS1',
      cut: diamondData.cut || 'Excellent',
      polish: diamondData.polish || 'Excellent',
      symmetry: diamondData.symmetry || 'Excellent',
      fluorescence: diamondData.fluorescence || 'None',
      lab: 'GIA',
      length: diamondData.measurements?.length || null,
      width: diamondData.measurements?.width || null,
      depth: diamondData.measurements?.depth || null,
      tablePercentage: diamondData.tablePercentage || null,
      depthPercentage: diamondData.depthPercentage || null,
      girdle: diamondData.girdle || null,
      culet: diamondData.culet || null,
      certificateUrl: diamondData.certificateNumber ? `https://www.gia.edu/report-check?reportno=${diamondData.certificateNumber}` : '',
      certificateComment: diamondData.comments || diamondData.inscriptions || '',
      status: 'Available',
      storeVisible: true,
      // Note: Price is not included as it's not on certificates
      price: 0 // User will manually enter this
    };

    console.log('✅ GIA ANALYZER: Successfully extracted diamond data:', cleanedData);

    return new Response(JSON.stringify({ 
      success: true,
      diamondData: cleanedData,
      rawExtraction: diamondData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Unhandled error in GIA Certificate Analyzer:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to analyze certificate',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
