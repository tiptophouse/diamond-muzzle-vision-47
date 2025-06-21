
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
    const { message, conversation_history = [], user_id } = await req.json();
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let inventoryContext = '';
    
    // Fetch inventory data from FastAPI backend if user_id is provided
    if (user_id) {
      try {
        console.log('Fetching inventory for user:', user_id);
        
        const inventoryResponse = await fetch(`https://api.mazalbot.com/api/v1/get_all_stones?user_id=${user_id}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ifj9ov1rh20fslfp',
            'Content-Type': 'application/json',
          },
        });

        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json();
          console.log('Retrieved inventory data:', inventoryData.length, 'diamonds');
          
          if (inventoryData && inventoryData.length > 0) {
            // Filter diamonds for this specific user
            const userDiamonds = inventoryData.filter(d => 
              d.owners?.includes(user_id) || d.owner_id === user_id
            );
            
            inventoryContext = `
Current Diamond Inventory (${userDiamonds.length} diamonds):
${userDiamonds.slice(0, 20).map(d => {
  const shape = d.shape || 'Unknown';
  const weight = d.weight || 'N/A';
  const color = d.color || 'N/A';
  const clarity = d.clarity || 'N/A';
  const pricePerCarat = d.price_per_carat || 'N/A';
  const stockNumber = d.stock_number || 'N/A';
  
  return `- ${shape} ${weight}ct ${color} ${clarity} - $${pricePerCarat}/ct (Stock: ${stockNumber})`;
}).join('\n')}
${userDiamonds.length > 20 ? `\n... and ${userDiamonds.length - 20} more diamonds` : ''}
            `;
          } else {
            inventoryContext = 'No diamonds currently in inventory.';
          }
        } else {
          console.error('Failed to fetch inventory:', inventoryResponse.status);
          inventoryContext = 'Unable to access inventory data at the moment.';
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        inventoryContext = 'Unable to access inventory data at the moment.';
      }
    } else {
      inventoryContext = 'User not identified - unable to access inventory data.';
    }

    const systemPrompt = `You are a sophisticated AI diamond assistant for a luxury diamond trading platform. You have access to real-time inventory data and can provide expert insights about diamonds, pricing, market trends, and recommendations.

${inventoryContext}

Your capabilities include:
- Analyzing diamond characteristics and pricing
- Providing market insights and trends
- Recommending diamonds based on criteria
- Answering questions about diamond quality, certification, and investment potential
- Helping with inventory management
- Providing pricing analysis

Always be professional, knowledgeable, and helpful. Use the inventory data to provide specific recommendations when relevant. If asked about specific diamonds, refer to the stock numbers and details from the inventory above.`;

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
