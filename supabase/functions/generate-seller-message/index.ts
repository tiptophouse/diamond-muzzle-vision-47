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
    const { buyer_name, buyer_telegram_id, search_query, matched_diamonds, seller_name } = await req.json();

    console.log('🤖 Generating seller messages:', {
      buyer_name,
      buyer_telegram_id,
      diamonds_count: matched_diamonds?.length,
      seller_name
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build diamond summary
    const diamondSummary = matched_diamonds.map((d: any) => 
      `${d.weight}ct ${d.shape}, ${d.color} ${d.clarity}, $${d.price_per_carat}/ct`
    ).join('\n');

    const systemPrompt = `You are an expert diamond seller assistant helping create personalized messages to buyers.
    
Your task: Generate 3 different message variations to send to a buyer who searched for diamonds.

Context:
- Buyer name: ${buyer_name}
- Buyer searched for: ${search_query}
- Matched diamonds:
${diamondSummary}
- Seller name: ${seller_name}

Requirements:
1. Generate exactly 3 messages with different tones: professional, friendly, urgent
2. Each message should:
   - Be in Hebrew (RTL language)
   - Mention specific diamond details
   - Create a sense of value and urgency
   - Include a clear call-to-action
   - Be concise (2-4 sentences max)
   - Feel personal and genuine

Return ONLY valid JSON in this format:
{
  "messages": [
    {
      "id": "msg_1",
      "content": "message text in Hebrew",
      "tone": "professional",
      "includedDiamonds": ["stock_number1", "stock_number2"]
    },
    {
      "id": "msg_2", 
      "content": "message text in Hebrew",
      "tone": "friendly",
      "includedDiamonds": ["stock_number1"]
    },
    {
      "id": "msg_3",
      "content": "message text in Hebrew", 
      "tone": "urgent",
      "includedDiamonds": ["stock_number1", "stock_number2"]
    }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the 3 message variations now.' }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('✅ AI Response:', aiResponse);

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      console.error('❌ Failed to parse AI response:', e);
      throw new Error('Invalid AI response format');
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Error in generate-seller-message:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        messages: [] 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
