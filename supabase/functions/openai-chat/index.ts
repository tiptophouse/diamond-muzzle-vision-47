
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Fetching inventory data from FastAPI backend...');
    
    // Get current inventory data from your FastAPI backend
    let inventory = [];
    let inventorySource = '';
    
    try {
      // First, we need to get the user ID from the request headers or body
      // For now, we'll fetch all diamonds and let the user context handle filtering
      const fastApiResponse = await fetch('https://api.mazalbot.com/api/v1/get_all_stones', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ifj9ov1rh20fslfp',
          'Content-Type': 'application/json',
        },
      });

      if (fastApiResponse.ok) {
        const fastApiData = await fastApiResponse.json();
        console.log('FastAPI response received:', fastApiData?.length || 0, 'diamonds');
        
        if (fastApiData && Array.isArray(fastApiData) && fastApiData.length > 0) {
          inventory = fastApiData;
          inventorySource = 'FastAPI backend';
          console.log('Found inventory data from FastAPI:', inventory.length, 'diamonds');
        } else {
          console.log('No data from FastAPI, response:', fastApiData);
        }
      } else {
        console.log('FastAPI request failed:', fastApiResponse.status, fastApiResponse.statusText);
      }
    } catch (fastApiError) {
      console.error('Error fetching from FastAPI:', fastApiError);
    }

    // If FastAPI fails, fallback to Supabase as backup
    if (!inventory || inventory.length === 0) {
      console.log('Falling back to Supabase tables...');
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseKey) {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.45.0');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Try the 'inventory' table first
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .limit(1000);

        if (inventoryData && inventoryData.length > 0) {
          inventory = inventoryData;
          inventorySource = 'Supabase inventory table';
          console.log('Found inventory data in Supabase inventory table:', inventory.length, 'diamonds');
        } else {
          console.log('No data in Supabase inventory table, trying diamonds table...');
          
          // Fallback to 'diamonds' table
          const { data: diamondsData, error: diamondsError } = await supabase
            .from('diamonds')
            .select('*')
            .limit(1000);

          if (diamondsData && diamondsData.length > 0) {
            inventory = diamondsData;
            inventorySource = 'Supabase diamonds table';
            console.log('Found inventory data in Supabase diamonds table:', inventory.length, 'diamonds');
          } else {
            console.log('No data found in either Supabase table. Inventory error:', inventoryError, 'Diamonds error:', diamondsError);
          }
        }
      }
    }

    // Build comprehensive context about the diamond inventory
    const inventoryContext = inventory && inventory.length > 0 ? `
Current Diamond Inventory (${inventory.length} diamonds total from ${inventorySource}):

SUMMARY:
- Total inventory count: ${inventory.length} diamonds
- Shapes available: ${[...new Set(inventory.map(d => d.shape).filter(Boolean))].join(', ')}
- Carat weight range: ${Math.min(...inventory.map(d => d.weight || d.carat || 0))}ct - ${Math.max(...inventory.map(d => d.weight || d.carat || 0))}ct
- Price range: $${Math.min(...inventory.map(d => {
  const weight = d.weight || d.carat || 1;
  const price = d.price_per_carat ? (d.price_per_carat * weight) : (d.price || 0);
  return price;
})).toLocaleString()} - $${Math.max(...inventory.map(d => {
  const weight = d.weight || d.carat || 1;
  const price = d.price_per_carat ? (d.price_per_carat * weight) : (d.price || 0);
  return price;
})).toLocaleString()}
- Colors available: ${[...new Set(inventory.map(d => d.color).filter(Boolean))].join(', ')}
- Clarities available: ${[...new Set(inventory.map(d => d.clarity).filter(Boolean))].join(', ')}

DETAILED INVENTORY (showing first 50 diamonds):
${inventory.slice(0, 50).map(d => {
  const weight = d.weight || d.carat || 0;
  const pricePerCarat = d.price_per_carat || 0;
  const totalPrice = pricePerCarat * weight;
  return `• ${weight}ct ${d.shape || 'Unknown'} ${d.color || ''} ${d.clarity || ''} ${d.cut || ''} - $${totalPrice.toLocaleString()} total${pricePerCarat ? ` ($${pricePerCarat.toLocaleString()}/ct)` : ''} [Stock: ${d.stock_number || d.id}]${d.lab ? ` [Lab: ${d.lab}]` : ''}${d.certificate_number ? ` [Cert: ${d.certificate_number}]` : ''}`;
}).join('\n')}
${inventory.length > 50 ? `\n... and ${inventory.length - 50} more diamonds` : ''}

INVENTORY ANALYTICS:
- Average carat weight: ${(inventory.reduce((sum, d) => sum + (d.weight || d.carat || 0), 0) / inventory.length).toFixed(2)}ct
- Average price per carat: $${Math.round(inventory.reduce((sum, d) => sum + (d.price_per_carat || 0), 0) / inventory.length).toLocaleString()}
- Total portfolio value: $${inventory.reduce((sum, d) => {
  const weight = d.weight || d.carat || 0;
  const pricePerCarat = d.price_per_carat || 0;
  return sum + (pricePerCarat * weight);
}, 0).toLocaleString()}
- Premium stones (>2ct): ${inventory.filter(d => (d.weight || d.carat || 0) > 2).length}
- High-value stones (>$10k/ct): ${inventory.filter(d => (d.price_per_carat || 0) > 10000).length}
- Largest diamond: ${Math.max(...inventory.map(d => d.weight || d.carat || 0))}ct
- Most expensive per carat: $${Math.max(...inventory.map(d => d.price_per_carat || 0)).toLocaleString()}/ct
    ` : 'No diamonds currently found in inventory. Please check your data source connection or upload your inventory.';

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
- Calculating total stock value and portfolio analytics

When users ask about "my diamonds", "my inventory", "my stock", refer specifically to the inventory data provided above. Always use the actual data to give precise, accurate answers with specific stock numbers, prices, and characteristics.

Be professional, knowledgeable, and provide actionable insights. Use the real inventory data to give specific recommendations and comparisons.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation_history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI with inventory context for', inventory.length, 'diamonds');

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
      inventory_count: inventory?.length || 0,
      inventory_source: inventorySource
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
