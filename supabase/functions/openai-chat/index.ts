
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation_history = [] } = await req.json();
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    
    // Get inventory data to provide context
    const { data: inventory, error } = await supabase
      .from('inventory')
      .select('*')
      .limit(50);

    if (error) {
      console.error('Error fetching inventory:', error);
    }

    // Build context about the diamond inventory
    const inventoryContext = inventory ? `
Current Diamond Inventory (${inventory.length} diamonds):
${inventory.map(d => `- ${d.shape} ${d.weight}ct ${d.color} ${d.clarity} - $${d.price_per_carat}/ct (Stock: ${d.stock_number})`).join('\n')}
    ` : '';

    const systemPrompt = `You are a sophisticated AI diamond assistant for a luxury diamond trading platform. You have access to real-time inventory data and can provide expert insights about diamonds, pricing, market trends, and recommendations.

${inventoryContext}

Your capabilities include:
- Analyzing diamond characteristics and pricing
- Providing market insights and trends
- Recommending diamonds based on criteria
- Answering questions about diamond quality, certification, and investment potential
- Helping with inventory management
- Providing pricing analysis

Always be professional, knowledgeable, and helpful. Use the inventory data to provide specific recommendations when relevant.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation_history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      status: 'success'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in openai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
