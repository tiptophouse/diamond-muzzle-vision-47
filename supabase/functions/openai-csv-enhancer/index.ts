import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    console.log('🤖 OpenAI CSV Enhancer - Processing request...');
    
    if (!openAIApiKey) {
      console.error('❌ OPENAI_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          enhanced_data: [] 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { csv_data } = await req.json();
    
    if (!csv_data || !Array.isArray(csv_data) || csv_data.length === 0) {
      console.error('❌ Invalid or empty CSV data provided');
      return new Response(
        JSON.stringify({ 
          error: 'No valid CSV data provided',
          enhanced_data: csv_data || [] 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🔍 Processing ${csv_data.length} rows of diamond data...`);

    // Sample a few rows for OpenAI analysis to avoid token limits
    const sampleSize = Math.min(3, csv_data.length);
    const sampleData = csv_data.slice(0, sampleSize);
    
    // Define valid values for diamond properties
    const validShapes = ['round brilliant', 'princess', 'cushion', 'oval', 'emerald', 'pear', 'marquise', 'asscher', 'radiant', 'heart'];
    const validColors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
    const validClarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];
    const validCuts = ['EXCELLENT', 'VERY GOOD', 'GOOD', 'POOR'];
    const validFluorescence = ['NONE', 'FAINT', 'MEDIUM', 'STRONG', 'VERY STRONG'];
    const validCulets = ['NONE', 'VERY SMALL', 'SMALL', 'MEDIUM', 'SLIGHTLY LARGE', 'LARGE', 'VERY LARGE'];

    const prompt = `You are a diamond data specialist. Analyze this CSV data and fix/standardize any invalid values.

Sample CSV data:
${JSON.stringify(sampleData, null, 2)}

Valid options:
- Shapes: ${validShapes.join(', ')}
- Colors: ${validColors.join(', ')}
- Clarities: ${validClarities.join(', ')}
- Cut/Polish/Symmetry: ${validCuts.join(', ')}
- Fluorescence: ${validFluorescence.join(', ')}
- Culet: ${validCulets.join(', ')}

Please return a JSON object with "mappings" array containing objects with:
- "field": the field name (e.g., "shape", "color", "clarity")
- "original_value": the original value from CSV
- "corrected_value": the standardized/corrected value
- "confidence": confidence level (0-1)

Only include mappings for fields that needed correction. Focus on obvious corrections like:
- "Round" → "round brilliant"
- "RD" → "round brilliant" 
- "G " → "G" (trim spaces)
- "vs1" → "VS1" (case correction)
- "EX" → "EXCELLENT"
- Empty values → appropriate defaults

Return only the JSON object, no additional text.`;

    console.log('🤖 Calling OpenAI API for data enhancement...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a diamond data specialist who standardizes and corrects diamond inventory data. Return only valid JSON responses.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('❌ OpenAI API request failed:', response.status, response.statusText);
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0].message.content;
    
    console.log('🤖 OpenAI response received:', aiContent.substring(0, 200) + '...');

    let mappings = [];
    try {
      const parsedResponse = JSON.parse(aiContent);
      mappings = parsedResponse.mappings || [];
    } catch (parseError) {
      console.warn('⚠️ Failed to parse OpenAI response, using fallback logic');
      mappings = [];
    }

    // Apply both OpenAI suggestions and built-in corrections
    const enhancedData = csv_data.map(row => {
      const enhanced = { ...row };
      
      // Apply OpenAI mappings first
      mappings.forEach(mapping => {
        if (enhanced[mapping.field] === mapping.original_value) {
          enhanced[mapping.field] = mapping.corrected_value;
        }
      });
      
      // Apply built-in corrections
      if (enhanced.shape) {
        const shapeLower = enhanced.shape.toLowerCase().trim();
        const shapeMap: { [key: string]: string } = {
          'round': 'round brilliant',
          'rd': 'round brilliant', 
          'rbc': 'round brilliant',
          'brilliant': 'round brilliant',
          'princess': 'princess',
          'pr': 'princess',
          'cushion': 'cushion',
          'cu': 'cushion',
          'oval': 'oval',
          'ov': 'oval',
          'emerald': 'emerald',
          'em': 'emerald',
          'pear': 'pear',
          'ps': 'pear',
          'marquise': 'marquise',
          'mq': 'marquise',
          'asscher': 'asscher',
          'as': 'asscher',
          'radiant': 'radiant',
          'ra': 'radiant',
          'heart': 'heart',
          'ht': 'heart'
        };
        enhanced.shape = shapeMap[shapeLower] || enhanced.shape;
      }
      
      // Fix color values
      if (enhanced.color) {
        const colorUpper = enhanced.color.toString().toUpperCase().trim();
        enhanced.color = validColors.includes(colorUpper) ? colorUpper : 'G';
      }
      
      // Fix clarity values
      if (enhanced.clarity) {
        const clarityUpper = enhanced.clarity.toString().toUpperCase().trim();
        enhanced.clarity = validClarities.includes(clarityUpper) ? clarityUpper : 'VS1';
      }
      
      // Fix cut/polish/symmetry values
      ['cut', 'polish', 'symmetry'].forEach(field => {
        if (enhanced[field]) {
          const gradeUpper = enhanced[field].toString().toUpperCase().trim();
          // Map common abbreviations
          const gradeMap: { [key: string]: string } = {
            'EX': 'EXCELLENT',
            'EXCELLENT': 'EXCELLENT',
            'VG': 'VERY GOOD',
            'VERY GOOD': 'VERY GOOD',
            'G': 'GOOD',
            'GOOD': 'GOOD',
            'F': 'POOR',
            'FAIR': 'POOR',
            'POOR': 'POOR'
          };
          enhanced[field] = gradeMap[gradeUpper] || 'EXCELLENT';
        }
      });
      
      // Fix fluorescence values
      if (enhanced.fluorescence) {
        const fluorUpper = enhanced.fluorescence.toString().toUpperCase().trim();
        const fluorMap: { [key: string]: string } = {
          'N': 'NONE',
          'NONE': 'NONE',
          'F': 'FAINT',
          'FAINT': 'FAINT',
          'M': 'MEDIUM',
          'MEDIUM': 'MEDIUM',
          'S': 'STRONG',
          'STRONG': 'STRONG',
          'VS': 'VERY STRONG',
          'VERY STRONG': 'VERY STRONG'
        };
        enhanced.fluorescence = fluorMap[fluorUpper] || 'NONE';
      }
      
      // Fix culet values
      if (enhanced.culet) {
        const culetUpper = enhanced.culet.toString().toUpperCase().trim();
        enhanced.culet = validCulets.includes(culetUpper) ? culetUpper : 'NONE';
      }
      
      return enhanced;
    });

    console.log(`✅ Enhanced ${enhancedData.length} rows with OpenAI + built-in corrections`);

    return new Response(
      JSON.stringify({ 
        enhanced_data: enhancedData,
        mappings: mappings,
        processed_count: enhancedData.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ OpenAI CSV enhancement failed:', error);
    
    // Return the original data as fallback
    const { csv_data } = await req.json().catch(() => ({ csv_data: [] }));
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        enhanced_data: csv_data || [],
        fallback: true 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});