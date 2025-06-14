
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
      console.error('❌ Configuration Error: OPENAI_API_KEY is not set in Supabase secrets.');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        response: 'I apologize, but I\'m currently unable to access my AI capabilities. The OpenAI API Key is missing. Please contact support to configure the integration.'
      }), {
        status: 200, // Return 200 to ensure the message is displayed in the chat UI
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, user_id, conversation_history = [] } = await req.json();
    
    console.log(`🤖 Processing message for user: ${user_id}. Message: "${message}"`);
    console.log(`🤖 Conversation history length: ${conversation_history.length}`);

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

    console.log('🤖 Sending the following messages to OpenAI:', JSON.stringify(messages, null, 2));
    console.log('🤖 Sending request to OpenAI API...');
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
    console.log('🤖 Received response from OpenAI API with status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ OpenAI API Error Body:', errorBody);
      const errorMessage = `OpenAI API Error: Status ${response.status} - ${errorBody}`;
      
      return new Response(JSON.stringify({ 
        error: errorMessage,
        response: `I'm having trouble connecting to my AI brain (OpenAI). It returned the following error: ${errorMessage}. This could be due to an invalid API key or a problem with the OpenAI service.`
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('🤖 OpenAI API response body:', JSON.stringify(data, null, 2));
    const aiResponse = data.choices[0]?.message?.content?.trim() || 'I apologize, but I received an empty response. Please try rephrasing your question.';

    console.log('✅ OpenAI response generated successfully.');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Unhandled error in OpenAI Chat function:', error);
    
    const fallbackResponse = `I'm currently experiencing technical difficulties, but I'm here to help with your diamond questions! While I work on reconnecting, feel free to ask about the 4Cs, pricing, or inventory management. Please try your question again in a moment.`;

    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      error: error.message,
      success: false
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
