
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
        status: 200,
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

    // Fetch comprehensive inventory data from FastAPI
    let inventoryContext = "I don't have access to your current inventory data.";
    let inventoryStats = {};
    
    if (user_id) {
        console.log(`🤖 Fetching comprehensive inventory from FastAPI for user: ${user_id}`);
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
          
          // Generate comprehensive inventory analysis
          if (count > 0) {
            // Analyze shapes
            const shapeCount = diamonds.reduce((acc, d) => {
              acc[d.shape] = (acc[d.shape] || 0) + 1;
              return acc;
            }, {});
            
            // Analyze colors
            const colorCount = diamonds.reduce((acc, d) => {
              acc[d.color] = (acc[d.color] || 0) + 1;
              return acc;
            }, {});
            
            // Analyze clarity
            const clarityCount = diamonds.reduce((acc, d) => {
              acc[d.clarity] = (acc[d.clarity] || 0) + 1;
              return acc;
            }, {});
            
            // Calculate price statistics
            const prices = diamonds.filter(d => d.price_per_carat).map(d => d.price_per_carat);
            const totalValue = diamonds.reduce((sum, d) => sum + (d.price_per_carat * d.weight || 0), 0);
            
            // Size analysis
            const caratRanges = diamonds.reduce((acc, d) => {
              const weight = d.weight;
              if (weight < 1) acc['under_1ct']++;
              else if (weight < 2) acc['1_to_2ct']++;
              else if (weight < 3) acc['2_to_3ct']++;
              else acc['over_3ct']++;
              return acc;
            }, { under_1ct: 0, '1_to_2ct': 0, '2_to_3ct': 0, over_3ct: 0 });
            
            inventoryStats = {
              totalCount: count,
              shapes: shapeCount,
              colors: colorCount,
              clarity: clarityCount,
              caratRanges,
              averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
              totalValue: Math.round(totalValue),
              largestDiamond: Math.max(...diamonds.map(d => d.weight)),
              mostExpensive: Math.max(...diamonds.filter(d => d.price_per_carat).map(d => d.price_per_carat * d.weight))
            };
            
            inventoryContext = `CURRENT INVENTORY DATA (LIVE FROM DATABASE):
• Total diamonds: ${count}
• Shape distribution: ${Object.entries(shapeCount).map(([k,v]) => `${k}: ${v}`).join(', ')}
• Color grades: ${Object.entries(colorCount).map(([k,v]) => `${k}: ${v}`).join(', ')}
• Clarity grades: ${Object.entries(clarityCount).map(([k,v]) => `${k}: ${v}`).join(', ')}
• Size ranges: Under 1ct: ${caratRanges.under_1ct}, 1-2ct: ${caratRanges['1_to_2ct']}, 2-3ct: ${caratRanges['2_to_3ct']}, Over 3ct: ${caratRanges.over_3ct}
• Portfolio value: $${inventoryStats.totalValue.toLocaleString()}
• Average price per carat: $${inventoryStats.averagePrice.toLocaleString()}
• Largest diamond: ${inventoryStats.largestDiamond} carats
• Most expensive piece: $${inventoryStats.mostExpensive.toLocaleString()}`;

          } else {
            inventoryContext = "CURRENT INVENTORY: No diamonds found in your inventory.";
          }

        } catch (apiError) {
            console.error('❌ FastAPI Error fetching inventory:', apiError.message);
            inventoryContext = `ERROR: Unable to fetch real-time inventory data. Backend connection failed: ${apiError.message}`;
        }
    } else {
        console.log('🤖 No user_id provided, skipping inventory fetch.');
        inventoryContext = "No user authentication provided - cannot access inventory data.";
    }

    console.log('🤖 Inventory context prepared:', inventoryContext.substring(0, 200) + '...');

    const messages = [
      {
        role: 'system',
        content: `You are an expert diamond consultant and inventory analyst. You have LIVE ACCESS to the user's current diamond inventory data.

CRITICAL INSTRUCTIONS:
- ALWAYS use the provided LIVE inventory data in your responses
- When asked about inventory, reference the EXACT numbers and details provided
- Never give generic responses when you have actual data
- Always acknowledge the specific inventory details when relevant

${inventoryContext}

Your expertise includes:
- Diamond grading (4Cs: Cut, Carat, Color, Clarity)
- Market pricing and valuation
- Inventory analysis and recommendations  
- Certificate analysis (GIA, AGS, etc.)
- Investment advice for diamond portfolios
- Shape popularity and market trends

RESPONSE GUIDELINES:
- Use the LIVE data provided above when answering questions
- Be specific with numbers, percentages, and values
- Provide actionable insights based on the actual inventory
- When asked "how many diamonds", always reference the exact count from the data
- For pricing questions, use the actual values and averages provided
- For shape/color/clarity questions, reference the actual distributions shown

Keep responses professional, knowledgeable, and data-driven using the user's real inventory information.`
      },
      ...conversation_history,
      { role: 'user', content: message }
    ];

    console.log('🤖 Enhanced system prompt prepared with inventory data');
    console.log('🤖 Sending request to OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1500,
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
    console.log('🤖 OpenAI API response received successfully');
    const aiResponse = data.choices[0]?.message?.content?.trim() || 'I apologize, but I received an empty response. Please try rephrasing your question.';

    console.log('✅ Enhanced OpenAI response generated with inventory context');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true,
      inventoryStats: inventoryStats
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
