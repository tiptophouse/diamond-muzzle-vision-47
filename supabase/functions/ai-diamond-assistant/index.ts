import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiamondAssistantRequest {
  query: string;
  userTelegramId: number;
  context?: {
    budget?: number;
    shape?: string;
    carat?: number;
    color?: string;
    clarity?: string;
  };
}

serve(async (req) => {
  console.log('🤖 AI Diamond Assistant function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userTelegramId, context }: DiamondAssistantRequest = await req.json();
    
    if (!query || !userTelegramId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get available diamonds from the seller's inventory (simulate FastAPI call)
    console.log('💎 Fetching available diamonds...');
    
    // Create AI prompt with diamond expertise
    const systemPrompt = `You are an expert diamond consultant and sales assistant. You help customers find the perfect diamond based on their needs and budget.

IMPORTANT GUIDELINES:
- Always be helpful and professional
- Ask clarifying questions about budget, preferred shape, size, etc.
- Explain diamond quality factors (4 Cs) in simple terms
- Suggest specific diamonds when possible
- Always end with directing them to view diamonds or contact for more details
- If they ask about price, explain that you can connect them with the seller for the best pricing
- Be enthusiastic but not pushy

AVAILABLE SERVICES:
- Diamond search and recommendations
- Quality education (4 Cs: Carat, Color, Clarity, Cut)
- Price guidance and budget assistance
- Certification information
- Custom diamond sourcing

RESPONSE FORMAT:
- Keep responses concise (max 150 words)
- Use emojis appropriately
- Include call-to-action buttons when relevant
- Always be encouraging and helpful

If user asks about specific diamonds or inventory, respond that you can help them find exactly what they're looking for and direct them to browse the available diamonds or contact the seller.`;

    const userPrompt = `Customer Query: "${query}"

${context ? `Context: 
Budget: ${context.budget ? '$' + context.budget : 'Not specified'}
Preferred Shape: ${context.shape || 'Not specified'}
Preferred Carat: ${context.carat || 'Not specified'}
Preferred Color: ${context.color || 'Not specified'}
Preferred Clarity: ${context.clarity || 'Not specified'}` : ''}

Please provide a helpful response as a diamond expert.`;

    console.log('🤖 Calling OpenAI API...');
    
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!openAiResponse.ok) {
      throw new Error('Failed to get AI response');
    }

    const aiData = await openAiResponse.json();
    const aiResponse = aiData.choices[0].message.content;

    // Create inline keyboard for next actions
    const baseUrl = 'https://uhhljqgxhdhbbhpohxll.supabase.co';
    const telegramBotUrl = `https://t.me/${Deno.env.get('TELEGRAM_BOT_USERNAME') || 'BrilliantBot_bot'}`;
    
    const responseWithButtons = {
      text: aiResponse,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '💎 Browse Available Diamonds',
              web_app: {
                url: `${baseUrl}/?ai_search=true`
              }
            }
          ],
          [
            {
              text: '📱 Contact Diamond Expert',
              url: `${telegramBotUrl}?start=contact_expert`
            }
          ],
          [
            {
              text: '🔍 Custom Diamond Search',
              web_app: {
                url: `${baseUrl}/?custom_search=true&budget=${context?.budget || ''}&shape=${context?.shape || ''}`
              }
            }
          ]
        ]
      }
    };

    // Log interaction for analytics
    try {
      await supabase.from('ai_assistant_interactions').insert({
        user_telegram_id: userTelegramId,
        query: query,
        ai_response: aiResponse,
        context: context,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to log interaction:', error);
    }

    console.log('✅ AI response generated successfully');
    
    return new Response(
      JSON.stringify({
        success: true,
        response: responseWithButtons,
        message: 'AI assistant response generated'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ AI Diamond Assistant error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
        details: 'Failed to generate AI response'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});