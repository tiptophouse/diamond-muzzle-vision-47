
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
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${backendAccessToken}`,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
              }
          });

          console.log(`🤖 FastAPI response status: ${apiResponse.status}`);

          if (!apiResponse.ok) {
              const errorBody = await apiResponse.text();
              console.error(`❌ FastAPI request failed: ${apiResponse.status}`, errorBody);
              throw new Error(`FastAPI request failed with status ${apiResponse.status}: ${errorBody}`);
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
              const shape = d.shape || 'Unknown';
              acc[shape] = (acc[shape] || 0) + 1;
              return acc;
            }, {});
            
            // Analyze colors
            const colorCount = diamonds.reduce((acc, d) => {
              const color = d.color || 'Unknown';
              acc[color] = (acc[color] || 0) + 1;
              return acc;
            }, {});
            
            // Analyze clarity
            const clarityCount = diamonds.reduce((acc, d) => {
              const clarity = d.clarity || 'Unknown';
              acc[clarity] = (acc[clarity] || 0) + 1;
              return acc;
            }, {});
            
            // Calculate price statistics
            const validDiamonds = diamonds.filter(d => d.price_per_carat && d.weight);
            const prices = validDiamonds.map(d => parseFloat(d.price_per_carat));
            const totalValue = validDiamonds.reduce((sum, d) => {
              const price = parseFloat(d.price_per_carat) || 0;
              const weight = parseFloat(d.weight) || 0;
              return sum + (price * weight);
            }, 0);
            
            // Size analysis
            const caratRanges = diamonds.reduce((acc, d) => {
              const weight = parseFloat(d.weight) || 0;
              if (weight < 1) acc['under_1ct']++;
              else if (weight < 2) acc['1_to_2ct']++;
              else if (weight < 3) acc['2_to_3ct']++;
              else acc['over_3ct']++;
              return acc;
            }, { under_1ct: 0, '1_to_2ct': 0, '2_to_3ct': 0, over_3ct: 0 });
            
            const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
            const maxWeight = Math.max(...diamonds.map(d => parseFloat(d.weight) || 0));
            const maxValue = Math.max(...validDiamonds.map(d => (parseFloat(d.price_per_carat) || 0) * (parseFloat(d.weight) || 0)));
            
            inventoryStats = {
              totalCount: count,
              shapes: shapeCount,
              colors: colorCount,
              clarity: clarityCount,
              caratRanges,
              averagePrice: Math.round(avgPrice),
              totalValue: Math.round(totalValue),
              largestDiamond: maxWeight,
              mostExpensive: Math.round(maxValue)
            };
            
            inventoryContext = `LIVE INVENTORY DATA (Real-time from your database):
📊 PORTFOLIO OVERVIEW:
• Total diamonds: ${count}
• Portfolio value: $${inventoryStats.totalValue.toLocaleString()}
• Average price per carat: $${inventoryStats.averagePrice.toLocaleString()}

💎 SHAPE DISTRIBUTION:
${Object.entries(shapeCount).map(([k,v]) => `• ${k}: ${v} stones`).join('\n')}

🎨 COLOR GRADES:
${Object.entries(colorCount).map(([k,v]) => `• ${k}: ${v} stones`).join('\n')}

✨ CLARITY GRADES:
${Object.entries(clarityCount).map(([k,v]) => `• ${k}: ${v} stones`).join('\n')}

📏 SIZE DISTRIBUTION:
• Under 1ct: ${caratRanges.under_1ct} stones
• 1-2ct: ${caratRanges['1_to_2ct']} stones  
• 2-3ct: ${caratRanges['2_to_3ct']} stones
• Over 3ct: ${caratRanges.over_3ct} stones

🏆 HIGHLIGHTS:
• Largest diamond: ${inventoryStats.largestDiamond} carats
• Most expensive piece: $${inventoryStats.mostExpensive.toLocaleString()}`;

          } else {
            inventoryContext = "CURRENT INVENTORY: No diamonds found in your inventory. Consider adding some diamonds to get personalized insights!";
          }

        } catch (apiError) {
            console.error('❌ FastAPI Error fetching inventory:', apiError.message);
            inventoryContext = `⚠️ CONNECTIVITY ISSUE: Unable to access your live inventory data from the backend. Error: ${apiError.message}. Please check your backend connection or try again later.`;
        }
    } else {
        console.log('🤖 No user_id provided, skipping inventory fetch.');
        inventoryContext = "❌ AUTHENTICATION REQUIRED: No user authentication provided - cannot access inventory data.";
    }

    console.log('🤖 Inventory context prepared for AI analysis');

    const systemPrompt = `You are an EXPERT diamond consultant and inventory analyst with LIVE ACCESS to the user's current diamond inventory.

🎯 CRITICAL INSTRUCTIONS:
- ALWAYS use the provided LIVE inventory data in your responses
- When asked about inventory, reference EXACT numbers and details provided
- Provide specific, actionable insights based on REAL data
- Never give generic responses when you have actual data
- Always acknowledge specific inventory details when relevant

${inventoryContext}

💎 YOUR EXPERTISE INCLUDES:
- Diamond grading (4Cs: Cut, Carat, Color, Clarity)
- Market pricing and valuation analysis
- Investment advice for diamond portfolios
- Certificate analysis (GIA, AGS, etc.)
- Shape popularity and market trends
- Inventory optimization recommendations

📋 RESPONSE GUIDELINES:
✅ Use LIVE data provided above when answering questions
✅ Be specific with numbers, percentages, and values
✅ Provide actionable insights based on actual inventory
✅ For "how many diamonds" questions, use exact count from data
✅ For pricing questions, use actual values and averages provided
✅ For shape/color/clarity questions, reference actual distributions
✅ Suggest specific improvements based on portfolio gaps
✅ Recommend market opportunities based on current holdings

🎯 EXAMPLE RESPONSES:
- "Based on your ${inventoryStats.totalCount || 0} diamonds worth $${(inventoryStats.totalValue || 0).toLocaleString()}..."
- "Your portfolio shows strength in [specific shapes/colors] but could benefit from..."
- "With an average price of $${(inventoryStats.averagePrice || 0).toLocaleString()} per carat, you're positioned in the [market segment]..."

Keep responses professional, data-driven, and actionable using the user's REAL inventory information.`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversation_history,
      { role: 'user', content: message }
    ];

    console.log('🤖 Enhanced system prompt prepared with live inventory data');
    console.log('🤖 Sending request to OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messages,
        max_tokens: 2000,
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
        response: `I'm having trouble connecting to my AI brain (OpenAI). Error: ${errorMessage}. This could be due to an invalid API key or a problem with the OpenAI service. Please check your OpenAI API key configuration.`
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('🤖 OpenAI API response received successfully');
    const aiResponse = data.choices[0]?.message?.content?.trim() || 'I apologize, but I received an empty response. Please try rephrasing your question.';

    console.log('✅ Enhanced OpenAI response generated with live inventory context');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true,
      inventoryStats: inventoryStats
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Unhandled error in OpenAI Chat function:', error);
    
    const fallbackResponse = `I'm currently experiencing technical difficulties, but I'm here to help with your diamond questions! 

🔧 **Troubleshooting Steps:**
1. Verify your OpenAI API key is correctly set in Supabase Edge Function Secrets
2. Check that BACKEND_URL and BACKEND_ACCESS_TOKEN are configured
3. Ensure your FastAPI backend is running and accessible

While I work on reconnecting, feel free to ask about diamond grading, pricing strategies, or inventory management principles. Please try your question again in a moment.

**Error details:** ${error.message}`;

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
