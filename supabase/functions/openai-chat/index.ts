
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 OpenAI Chat: Function called');
    
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        response: 'I apologize, but I\'m currently unable to access my AI capabilities. Please contact support to configure the OpenAI integration.'
      }), {
        status: 200, // Return 200 so frontend gets the fallback message
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, user_id, conversation_history = [] } = await req.json();
    
    console.log('🤖 Processing message for user:', user_id);

    const messages = [
      {
        role: 'system',
        content: `You are a diamond expert AI assistant for a diamond inventory management system. You help with:
        - Diamond grading and evaluation
        - Market pricing insights
        - Inventory management advice
        - Diamond certification questions
        - General diamond knowledge
        
        Keep responses helpful, professional, and focused on diamonds and jewelry.`
      },
      ...conversation_history,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I encountered an issue processing your request.';

    console.log('✅ OpenAI response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ OpenAI Chat function error:', error);
    
    // Return a helpful fallback response instead of an error
    const fallbackResponse = `I'm currently experiencing technical difficulties, but I'm here to help with your diamond questions! 
    
While I work on reconnecting, here are some things I can usually help with:
• Diamond grading (4Cs: Cut, Color, Clarity, Carat)
• Price estimates and market insights
• Certificate verification
• Inventory management tips
• Diamond care and maintenance

Please try your question again in a moment, or feel free to ask about any diamond-related topic!`;

    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      error: error.message,
      success: false
    }), {
      status: 200, // Return 200 so frontend shows the fallback message
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
