import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const backendUrl = Deno.env.get('BACKEND_URL');
const backendAccessToken = Deno.env.get('BACKEND_ACCESS_TOKEN');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 AI Enhanced Chat: Function called');
    
    if (!openAIApiKey || !backendUrl || !backendAccessToken) {
      throw new Error('Missing required environment variables');
    }

    const { message, user_id, conversation_history = [] } = await req.json();
    console.log(`🤖 Processing message for user: ${user_id}`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Fetch inventory data
    let inventoryContext = "No inventory data available.";
    let inventoryStats = {};
    
    if (user_id) {
      try {
        const inventoryEndpoint = `${backendUrl}/api/v1/get_all_stones?user_id=${user_id}`;
        const apiResponse = await fetch(inventoryEndpoint, {
          headers: {
            'Authorization': `Bearer ${backendAccessToken}`,
            'Accept': 'application/json',
          }
        });

        if (apiResponse.ok) {
          const inventoryData = await apiResponse.json();
          let diamonds = Array.isArray(inventoryData) ? inventoryData : 
                        inventoryData?.data || inventoryData?.diamonds || [];
          
          const count = diamonds.length;
          
          if (count > 0) {
            const shapeCount = diamonds.reduce((acc: any, d: any) => {
              acc[d.shape] = (acc[d.shape] || 0) + 1;
              return acc;
            }, {});
            
            const colorCount = diamonds.reduce((acc: any, d: any) => {
              acc[d.color] = (acc[d.color] || 0) + 1;
              return acc;
            }, {});
            
            const totalValue = diamonds.reduce((sum: number, d: any) => 
              sum + (d.price_per_carat * d.weight || 0), 0);
            
            inventoryStats = {
              totalCount: count,
              shapes: shapeCount,
              colors: colorCount,
              totalValue: Math.round(totalValue),
            };
            
            inventoryContext = `CURRENT INVENTORY:
• Total diamonds: ${count}
• Shape distribution: ${Object.entries(shapeCount).map(([k,v]) => `${k}: ${v}`).join(', ')}
• Color distribution: ${Object.entries(colorCount).map(([k,v]) => `${k}: ${v}`).join(', ')}
• Total portfolio value: $${inventoryStats.totalValue.toLocaleString()}`;
          }
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    }

    // Fetch AI learned patterns
    let learnedPatterns = "";
    try {
      const { data: patterns } = await supabase.rpc('get_ai_recommendations', {
        p_user_telegram_id: user_id,
        p_context_type: 'general'
      });

      if (patterns && patterns.length > 0) {
        learnedPatterns = `\n\nAI LEARNED PATTERNS (from ${patterns.length} successful interactions):`;
        patterns.forEach((pattern: any, idx: number) => {
          learnedPatterns += `\n${idx + 1}. ${pattern.pattern_type} (confidence: ${(pattern.confidence * 100).toFixed(0)}%)`;
          learnedPatterns += `\n   ${JSON.stringify(pattern.recommendation).substring(0, 150)}...`;
        });
      }
    } catch (error) {
      console.error('Error fetching learned patterns:', error);
    }

    // Build enhanced system prompt
    const systemPrompt = `You are an expert diamond consultant with AI-powered learning capabilities.

${inventoryContext}${learnedPatterns}

CRITICAL INSTRUCTIONS:
- Use the LIVE inventory data and learned patterns in your responses
- Reference specific numbers and details from the data
- Apply learned patterns to make smarter recommendations
- When you notice a successful interaction pattern, emphasize it

Your AI is constantly learning from successful deals, buyer preferences, and market patterns. 
Use this knowledge to provide increasingly personalized and effective advice.

Keep responses professional, data-driven, and actionable.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation_history,
      { role: 'user', content: message }
    ];

    console.log('🤖 Sending request to OpenAI with enhanced AI context...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content?.trim() || 
                       'I apologize, but I received an empty response.';

    console.log('✅ AI Enhanced response generated with learned patterns');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true,
      inventoryStats: inventoryStats,
      patternsUsed: learnedPatterns.length > 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in AI Enhanced Chat:', error);
    
    return new Response(JSON.stringify({ 
      response: "I'm experiencing technical difficulties. Please try again.",
      error: error.message,
      success: false
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
