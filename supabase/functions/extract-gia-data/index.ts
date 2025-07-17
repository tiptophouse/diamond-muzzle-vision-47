import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!imageData) {
      throw new Error('No image data provided');
    }

    // Remove data URL prefix if present
    const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

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
            content: `You are a GIA certificate data extraction specialist. Extract ALL diamond information from the certificate image and return it as a JSON object with these exact fields:
            {
              "stock": "string",
              "shape": "string (ROUND, PRINCESS, EMERALD, ASSCHER, OVAL, RADIANT, PEAR, HEART, MARQUISE, CUSHION)",
              "weight": number,
              "color": "string (D, E, F, G, H, I, J, K, L, M)",
              "clarity": "string (FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2, SI3, I1, I2, I3)",
              "lab": "string (usually GIA)",
              "certificate_number": number,
              "length": number,
              "width": number,
              "depth": number,
              "ratio": number,
              "cut": "string (EXCELLENT, VERY_GOOD, GOOD, FAIR, POOR)",
              "polish": "string (EXCELLENT, VERY_GOOD, GOOD, FAIR, POOR)",
              "symmetry": "string (EXCELLENT, VERY_GOOD, GOOD, FAIR, POOR)",
              "fluorescence": "string (NONE, FAINT, MEDIUM, STRONG, VERY_STRONG)",
              "table": number,
              "depth_percentage": number,
              "gridle": "string",
              "culet": "string",
              "certificate_comment": "string",
              "rapnet": number,
              "price_per_carat": number,
              "picture": "string"
            }

            Extract exact values from the certificate. If a field is not visible, use null. Be very precise with measurements and percentages.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all diamond information from this GIA certificate and return as JSON:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0].message.content;

    console.log('Extracted text:', extractedText);

    // Try to parse as JSON
    let parsedData;
    try {
      parsedData = JSON.parse(extractedText);
    } catch (parseError) {
      // If direct JSON parse fails, try to extract JSON from the response
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract valid JSON from OpenAI response');
      }
    }

    // Upload certificate image to Supabase storage
    let certificateUrl = null;
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
      
      // Convert base64 to binary data
      const binaryData = Uint8Array.from(atob(base64Image), (c) => c.charCodeAt(0));
      
      // Generate unique filename
      const timestamp = Date.now();
      const certificateNumber = parsedData.certificate_number || 'unknown';
      const fileName = `gia-certificate-${certificateNumber}-${timestamp}.jpg`;
      
      // Upload to diamond-certificates bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('diamond-certificates')
        .upload(fileName, binaryData, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading certificate:', uploadError);
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('diamond-certificates')
          .getPublicUrl(fileName);
        
        certificateUrl = urlData.publicUrl;
        console.log('Certificate uploaded successfully to:', certificateUrl);
      }
    } catch (uploadError) {
      console.error('Error during certificate upload:', uploadError);
      // Continue without failing the entire process
    }

    // Add certificate URL to parsed data
    if (certificateUrl) {
      parsedData.certificate_url = certificateUrl;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: parsedData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-gia-data function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});