
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const backendUrl = Deno.env.get('BACKEND_URL');
const backendAccessToken = Deno.env.get('BACKEND_ACCESS_TOKEN');

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

    if (!backendUrl || !backendAccessToken) {
      console.error('❌ Configuration Error: Backend URL or Access Token is not set in Supabase secrets.');
      return new Response(JSON.stringify({ 
        error: 'Backend service configuration error',
        response: 'I apologize, but I\'m currently unable to access the main inventory system. The backend service is not configured correctly. Please contact support.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, user_id, conversation_history = [] } = await req.json();
    
    console.log(`🤖 Processing message for user: ${user_id}. Message: "${message}"`);
    console.log(`🤖 Conversation history length: ${conversation_history.length}`);

    // Fetch inventory data from FastAPI
    let inventorySummary = "The user's inventory data is not available at the moment.";
    if (user_id) {
        console.log(`🤖 Fetching inventory from FastAPI for user: ${user_id}`);
        try {
          const inventoryEndpoint = `${backendUrl}/api/v1/get_all_stones?user_id=${user_id}`;
          console.log(`🤖 Calling FastAPI endpoint: ${inventoryEndpoint}`);
          
          const apiResponse = await fetch(inventoryEndpoint, {
              headers: {
                  'Authorization': `Bearer ${backendAccessToken}`,
                  'Accept': 'application/json',
              }
          });

          console.log(`🤖 FastAPI response status: ${apiResponse.status}`);

          if (!apiResponse.ok) {
              const errorBody = await apiResponse.text();
              console.error(`❌ FastAPI request failed: ${apiResponse.status}`, errorBody);
              throw new Error(`FastAPI request failed with status ${apiResponse.status}.`);
          }

          const inventoryData = await apiResponse.json();
          
          let diamonds = [];
          if(Array.isArray(inventoryData)) {
              diamonds = inventoryData;
          } else if (inventoryData && Array.isArray(inventoryData.data)) {
              diamonds = inventoryData.data;
          } else if (inventoryData && Array.isArray(inventoryData.diamonds)) {
              diamonds = inventoryData.diamonds;
          }
          
          const count = diamonds.length;
          console.log(`🤖 Found ${count} diamonds in inventory for user ${user_id} from FastAPI.`);
          inventorySummary = `The user currently has ${count} diamonds in their inventory.`;

        } catch (apiError) {
            console.error('❌ FastAPI Error fetching inventory:', apiError.message);
            inventorySummary = `There was an error fetching real-time inventory data from the backend. I cannot provide an exact count right now. The error was: ${apiError.message}.`;
        }
    } else {
        console.log('🤖 No user_id provided, skipping inventory fetch.');
    }

    const messages = [
      {
        role: 'system',
        content: `You are a diamond expert AI assistant for a diamond inventory management system. You help with:
        - Diamond grading and evaluation
        - Market pricing insights
        - Inventory management advice
        - Diamond certification questions
        - General diamond knowledge
        
        Keep responses helpful, professional, and focused on diamonds and jewelry.
        
        Here is a summary of the user's current inventory: ${inventorySummary}`
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
