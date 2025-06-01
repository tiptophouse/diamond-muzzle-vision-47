
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

    // Initialize Supabase client to get real inventory data
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    
    // Get current inventory data from your database
    const { data: inventory, error } = await supabase
      .from('inventory')
      .select('*')
      .limit(100); // Get up to 100 diamonds for context

    if (error) {
      console.error('Error fetching inventory:', error);
    }

    // Build comprehensive context about the diamond inventory
    const inventoryContext = inventory && inventory.length > 0 ? `
Current Diamond Inventory (${inventory.length} diamonds total):

SUMMARY:
- Total inventory count: ${inventory.length} diamonds
- Shapes available: ${[...new Set(inventory.map(d => d.shape))].join(', ')}
- Carat weight range: ${Math.min(...inventory.map(d => d.weight || 0))}ct - ${Math.max(...inventory.map(d => d.weight || 0))}ct
- Price range: $${Math.min(...inventory.map(d => (d.price_per_carat || 0) * (d.weight || 0)))} - $${Math.max(...inventory.map(d => (d.price_per_carat || 0) * (d.weight || 0)))}
- Colors available: ${[...new Set(inventory.map(d => d.color))].join(', ')}
- Clarities available: ${[...new Set(inventory.map(d => d.clarity))].join(', ')}

DETAILED INVENTORY:
${inventory.map(d => 
  `• ${d.weight}ct ${d.shape} ${d.color} ${d.clarity} ${d.cut || ''} - $${((d.price_per_carat || 0) * (d.weight || 0)).toLocaleString()} total ($${d.price_per_carat?.toLocaleString() || 0}/ct) [Stock: ${d.stock_number}] ${d.lab ? `[Lab: ${d.lab}]` : ''} ${d.certificate_number ? `[Cert: ${d.certificate_number}]` : ''}`
).join('\n')}

INVENTORY ANALYTICS:
- Average carat weight: ${(inventory.reduce((sum, d) => sum + (d.weight || 0), 0) / inventory.length).toFixed(2)}ct
- Average price per carat: $${Math.round(inventory.reduce((sum, d) => sum + (d.price_per_carat || 0), 0) / inventory.length).toLocaleString()}
- Total portfolio value: $${inventory.reduce((sum, d) => sum + ((d.price_per_carat || 0) * (d.weight || 0)), 0).toLocaleString()}
- Premium stones (>2ct): ${inventory.filter(d => (d.weight || 0) > 2).length}
- High-value stones (>$10k/ct): ${inventory.filter(d => (d.price_per_carat || 0) > 10000).length}
    ` : 'No diamonds currently in inventory.';

    const systemPrompt = `You are an expert AI diamond assistant for Mazalbot, a luxury diamond trading platform. You have access to real-time inventory data and can provide sophisticated insights about diamonds, pricing, market analysis, and recommendations.

${inventoryContext}

Your capabilities include:
- Analyzing specific diamonds in the current inventory with exact details
- Providing market insights and pricing analysis
- Recommending diamonds based on criteria (budget, size, quality, etc.)
- Answering questions about diamond quality, certification, and investment potential
- Helping with inventory management and analytics
- Comparing diamonds in the current inventory
- Identifying the biggest, smallest, most expensive, best value diamonds
- Providing detailed breakdowns by shape, color, clarity, etc.

When users ask about "my diamonds" or "my inventory", refer specifically to the inventory data provided above. Always use the actual data to give precise, accurate answers with specific stock numbers, prices, and characteristics.

Be professional, knowledgeable, and provide actionable insights. Use the real inventory data to give specific recommendations and comparisons.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation_history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI with inventory context');

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
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Successfully got response from OpenAI');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      status: 'success',
      inventory_count: inventory?.length || 0
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
