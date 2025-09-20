import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, conversationHistory } = await req.json();
    
    console.log('🤖 Diamond Chat AI Request:', { message, userId, historyLength: conversationHistory?.length });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Fetch user's diamonds for context
    let userDiamonds = [];
    if (userId) {
      const { data: diamonds, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('deleted_at', null)
        .limit(20);
        
      if (!error && diamonds) {
        userDiamonds = diamonds;
      }
    }

    // Create context for the AI
    const systemPrompt = `You are a professional diamond expert and trading assistant for BrilliantBot. You help users with:

1. Diamond analysis and recommendations
2. Market insights and pricing
3. Investment advice
4. Quality assessment
5. Finding specific diamonds

USER'S DIAMOND INVENTORY (first 20 items):
${userDiamonds.length > 0 ? JSON.stringify(userDiamonds, null, 2) : 'No diamonds in inventory'}

GUIDELINES:
- Be professional, knowledgeable, and helpful
- Provide specific, actionable advice
- Use diamond terminology correctly
- When recommending diamonds, be specific about why
- If asked about pricing, provide market context
- Always be honest about diamond quality and value
- Suggest diamonds from the user's inventory when relevant
- Provide insights about market trends when appropriate

Keep responses concise but informative. Use emojis sparingly and professionally.`;

    // Prepare conversation messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-8).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('📤 Sending to OpenAI:', { messageCount: messages.length });

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        functions: [
          {
            name: 'recommend_diamonds',
            description: 'Recommend specific diamonds from inventory based on user criteria',
            parameters: {
              type: 'object',
              properties: {
                criteria: {
                  type: 'object',
                  properties: {
                    minCarat: { type: 'number' },
                    maxCarat: { type: 'number' },
                    shapes: { type: 'array', items: { type: 'string' } },
                    colors: { type: 'array', items: { type: 'string' } },
                    clarities: { type: 'array', items: { type: 'string' } },
                    maxPrice: { type: 'number' },
                    minPrice: { type: 'number' }
                  }
                },
                reason: { type: 'string', description: 'Explanation for the recommendation' }
              },
              required: ['criteria', 'reason']
            }
          }
        ],
        function_call: 'auto'
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const aiResult = await openaiResponse.json();
    console.log('📥 OpenAI Response received');

    let response = aiResult.choices[0].message.content || "I apologize, but I couldn't process your request right now.";
    let recommendedDiamonds = [];
    let marketInsights = null;
    let priceAnalysis = null;

    // Handle function calls
    if (aiResult.choices[0].message.function_call) {
      const functionCall = aiResult.choices[0].message.function_call;
      
      if (functionCall.name === 'recommend_diamonds') {
        try {
          const { criteria, reason } = JSON.parse(functionCall.arguments);
          console.log('💎 Diamond recommendation criteria:', criteria);

          // Search for matching diamonds
          let query = supabase
            .from('inventory')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null);

          if (criteria.minCarat) query = query.gte('weight', criteria.minCarat);
          if (criteria.maxCarat) query = query.lte('weight', criteria.maxCarat);
          if (criteria.minPrice) query = query.gte('price_per_carat', criteria.minPrice);
          if (criteria.maxPrice) query = query.lte('price_per_carat', criteria.maxPrice);
          if (criteria.shapes && criteria.shapes.length > 0) {
            query = query.in('shape', criteria.shapes);
          }
          if (criteria.colors && criteria.colors.length > 0) {
            query = query.in('color', criteria.colors);
          }
          if (criteria.clarities && criteria.clarities.length > 0) {
            query = query.in('clarity', criteria.clarities);
          }

          const { data: matchingDiamonds } = await query.limit(5);
          
          if (matchingDiamonds && matchingDiamonds.length > 0) {
            recommendedDiamonds = matchingDiamonds.map(d => ({
              id: d.id,
              stockNumber: d.stock_number,
              carat: d.weight,
              shape: d.shape,
              color: d.color,
              clarity: d.clarity,
              cut: d.cut,
              price: d.price_per_carat * d.weight,
              imageUrl: d.picture || d.image_url,
              gem360Url: d.gem360_url
            }));

            response = `${reason}\n\nBased on your criteria, I found ${matchingDiamonds.length} diamonds that match your requirements. Here are my top recommendations:`;
          } else {
            response = `${reason}\n\nUnfortunately, I couldn't find any diamonds in your inventory that exactly match these criteria. You might want to consider adjusting your requirements or exploring our marketplace.`;
          }
        } catch (error) {
          console.error('Error processing diamond recommendation:', error);
        }
      }
    }

    // Generate market insights for certain keywords
    if (message.toLowerCase().includes('market') || message.toLowerCase().includes('price') || message.toLowerCase().includes('investment')) {
      marketInsights = "Current market trends show strong demand for certified diamonds with excellent cut grades. Lab-grown diamonds are gaining market share, while natural diamonds maintain premium pricing.";
    }

    // Generate price analysis for price-related queries
    if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost') || message.toLowerCase().includes('value')) {
      priceAnalysis = "Diamond prices are influenced by the 4Cs, certification, and market demand. Consider certified stones from reputable labs for better resale value.";
    }

    // Store conversation for analytics
    try {
      await supabase.from('chat_conversation_messages').insert({
        conversation_id: crypto.randomUUID(),
        role: 'user',
        content: message,
        tokens_used: aiResult.usage?.total_tokens || 0
      });

      await supabase.from('chat_conversation_messages').insert({
        conversation_id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        tokens_used: aiResult.usage?.total_tokens || 0
      });
    } catch (error) {
      console.error('Error storing conversation:', error);
    }

    console.log('✅ Chat AI response generated successfully');

    return new Response(JSON.stringify({
      response,
      recommendedDiamonds,
      marketInsights,
      priceAnalysis,
      tokensUsed: aiResult.usage?.total_tokens || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Diamond Chat AI Error:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to process chat request',
      response: "I'm experiencing technical difficulties right now. Please try again in a moment.",
      recommendedDiamonds: [],
      marketInsights: null,
      priceAnalysis: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});