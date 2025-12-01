import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Diamond {
  stock: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  price_per_carat: number;
  cut?: string;
  picture?: string;
  certificate_url?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diamonds, buyerName, searchQuery } = await req.json();
    
    // Sanitize buyer name: remove IDs / numbers and generic "Buyer" label
    const cleanedBuyerName = typeof buyerName === 'string'
      ? buyerName.replace(/\d+/g, '').replace(/buyer/gi, '').trim()
      : '';
    const displayBuyerName = cleanedBuyerName || 'לקוח יקר';
    
    if (!diamonds || !Array.isArray(diamonds) || diamonds.length === 0) {
      throw new Error('Invalid diamonds data');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const BACKEND_URL = Deno.env.get('BACKEND_URL');
    const BACKEND_TOKEN = Deno.env.get('FASTAPI_BEARER_TOKEN');
    
    // Fetch complete diamond details from FastAPI including images
    const enrichedDiamonds = await Promise.all(
      diamonds.map(async (d: Diamond) => {
        try {
          if (BACKEND_URL && BACKEND_TOKEN) {
            const response = await fetch(`${BACKEND_URL}/api/v1/get_all_stones?stock_number=${d.stock}`, {
              headers: {
                'Authorization': `Bearer ${BACKEND_TOKEN}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0) {
                // Use the picture and certificate_url from FastAPI response
                return { 
                  ...d, 
                  picture: data[0].picture || d.picture,
                  certificate_url: data[0].certificate_url || d.certificate_url,
                  cut: data[0].cut || d.cut
                };
              }
            }
          }
        } catch (err) {
          console.error(`⚠️ Failed to fetch image for ${d.stock}:`, err);
        }
        return d;
      })
    );

    console.log('📸 Enriched diamonds with images:', enrichedDiamonds.filter(d => d.picture).length);

    // Create diamond list for AI prompt
    const diamondList = enrichedDiamonds.map((d: Diamond, idx: number) => {
      const totalPrice = d.price_per_carat * d.weight;
      // If price is negative, it represents a discount percentage
      const priceDisplay = totalPrice < 0 
        ? `הנחה ${Math.abs(totalPrice)}%` 
        : `$${totalPrice.toLocaleString()}`;
      
      return `${idx + 1}. ${d.shape} ${d.weight}ct - ${d.color} ${d.clarity}${d.cut ? ` (${d.cut})` : ''} - ${priceDisplay} (מלאי: ${d.stock})`;
    }).join('\n');

    const totalValue = enrichedDiamonds.reduce((sum: number, d: Diamond) => {
      const price = d.price_per_carat * d.weight;
      // Skip negative prices (discounts) in total calculation
      return price >= 0 ? sum + price : sum;
    }, 0);

    const systemPrompt = `You are writing a message that a BUYER will receive from a diamond dealer.

CRITICAL RULES:
- Write FROM the dealer's perspective TO the buyer
- Address the buyer directly as "you" (אתה/את in Hebrew)
- DO NOT include buyer's user ID, telegram ID, or any technical identifiers  
- DO NOT write as if the buyer is the seller - they are BUYING diamonds
- Be warm, welcoming, and professional
- Keep it brief (2-3 sentences maximum)
- Explain what diamonds you found that match their search
- Invite them to view details and contact you for more info
- Use friendly Hebrew tone
- IMPORTANT: Write ONLY in Hebrew language`;

    const userPrompt = `Write a message in HEBREW to a buyer named "${displayBuyerName}" about ${enrichedDiamonds.length} diamonds you found for them:
 
${diamondList}
 
${searchQuery ? `They searched for: "${searchQuery}"` : 'Based on their preferences'}
 
REMEMBER: 
- This message is TO the buyer (they are purchasing)
- DO NOT include any user IDs, telegram IDs, or technical information, even if they appear in the name
- Do NOT mention numbers that look like an ID (such as 2084882603)
- Write in Hebrew only
- Make them excited about these diamonds you found for them`;

    console.log('🤖 Generating message with AI...');
    
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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedMessage = data.choices?.[0]?.message?.content;

    if (!generatedMessage) {
      throw new Error('No message generated by AI');
    }

    console.log('✅ Message generated successfully');

    return new Response(
      JSON.stringify({ 
        message: generatedMessage,
        diamonds: enrichedDiamonds.map((d: Diamond) => {
          const totalPrice = d.price_per_carat * d.weight;
          return {
            stock: d.stock,
            shape: d.shape,
            weight: d.weight,
            color: d.color,
            clarity: d.clarity,
            cut: d.cut || 'EXCELLENT',
            price: totalPrice,
            picture: d.picture,
            certificate_url: d.certificate_url
          };
        }),
        totalValue,
        stockNumbers: enrichedDiamonds.map((d: Diamond) => d.stock)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating message:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate message' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
