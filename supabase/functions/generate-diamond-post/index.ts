import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const backendUrl = Deno.env.get('BACKEND_URL');
const backendAccessToken = Deno.env.get('BACKEND_ACCESS_TOKEN');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiamondPostRequest {
  telegram_id: number;
  chat_id?: string;
  certificate_number?: string;
  stock_number?: string;
  platform?: 'telegram' | 'instagram' | 'facebook' | 'general';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('💎 Diamond post generation called');
    
    const request: DiamondPostRequest = await req.json();
    console.log('💎 Request:', JSON.stringify(request, null, 2));

    // Get diamond data from inventory
    const diamondData = await getDiamondData(request.telegram_id, request.certificate_number, request.stock_number);
    
    if (!diamondData) {
      console.log('💎 No diamond data found');
      return new Response(JSON.stringify({ error: 'Diamond not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('💎 Found diamond:', diamondData.stock_number);

    // Generate compelling post content using AI
    const postContent = await generatePostContent(diamondData, request.platform || 'general');
    
    // Create and store the post
    const post = {
      telegram_id: request.telegram_id,
      diamond_data: diamondData,
      post_content: postContent,
      platform: request.platform || 'general',
      created_at: new Date().toISOString(),
      status: 'generated'
    };

    // Store the generated post for future reference
    await storeGeneratedPost(post);

    console.log('💎 Post generated successfully');

    return new Response(JSON.stringify({
      success: true,
      post_content: postContent,
      diamond: {
        stock_number: diamondData.stock_number,
        shape: diamondData.shape,
        weight: diamondData.weight,
        color: diamondData.color,
        clarity: diamondData.clarity
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Diamond post generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function getDiamondData(telegram_id: number, certificate_number?: string, stock_number?: string) {
  try {
    // First try to get from Supabase inventory
    let query = supabase
      .from('inventory')
      .select('*')
      .eq('user_id', telegram_id)
      .is('deleted_at', null);

    if (certificate_number) {
      query = query.eq('certificate_number', certificate_number);
    } else if (stock_number) {
      query = query.eq('stock_number', stock_number);
    } else {
      // Get the most recent diamond
      query = query.order('created_at', { ascending: false }).limit(1);
    }

    const { data: supabaseData, error } = await query;

    if (error) {
      console.error('❌ Supabase query error:', error);
    }

    if (supabaseData && supabaseData.length > 0) {
      console.log('💎 Found diamond in Supabase');
      return supabaseData[0];
    }

    // Fallback to FastAPI backend
    if (backendUrl && backendAccessToken) {
      console.log('💎 Trying FastAPI backend');
      const inventoryUrl = `${backendUrl}/api/v1/get_all_stones?user_id=${telegram_id}`;
      
      const response = await fetch(inventoryUrl, {
        headers: {
          'Authorization': `Bearer ${backendAccessToken}`,
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const inventoryData = await response.json();
        let diamonds = Array.isArray(inventoryData) ? inventoryData : inventoryData.data || [];
        
        if (certificate_number) {
          diamonds = diamonds.filter(d => d.certificate_number == certificate_number);
        } else if (stock_number) {
          diamonds = diamonds.filter(d => d.stock_number === stock_number);
        }
        
        if (diamonds.length > 0) {
          console.log('💎 Found diamond in FastAPI');
          return diamonds[0];
        }
      }
    }

    return null;
  } catch (error) {
    console.error('❌ Error getting diamond data:', error);
    return null;
  }
}

async function generatePostContent(diamond: any, platform: string) {
  if (!openaiApiKey) {
    return generateFallbackPost(diamond, platform);
  }

  try {
    const prompt = createPostPrompt(diamond, platform);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert diamond marketing specialist who creates compelling, high-converting social media posts for luxury diamonds. Your posts should be emotionally engaging, highlight unique value propositions, and drive sales through expert storytelling.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      console.error('❌ OpenAI API error:', response.status);
      return generateFallbackPost(diamond, platform);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('❌ Error generating AI content:', error);
    return generateFallbackPost(diamond, platform);
  }
}

function createPostPrompt(diamond: any, platform: string) {
  const has360View = diamond.certificate_url && diamond.certificate_url.includes('v360.in');
  const totalPrice = diamond.price_per_carat && diamond.weight ? 
    (diamond.price_per_carat * diamond.weight).toLocaleString() : 'Contact for pricing';

  return `Create a compelling ${platform} post for this exceptional diamond:

**Diamond Details:**
- Shape: ${diamond.shape || 'N/A'}
- Carat: ${diamond.weight || 'N/A'} ct
- Color: ${diamond.color || 'N/A'}
- Clarity: ${diamond.clarity || 'N/A'}
- Cut: ${diamond.cut || 'N/A'}
- Certificate: ${diamond.certificate_number || 'N/A'}
- Lab: ${diamond.lab || 'N/A'}
- Stock #: ${diamond.stock_number || 'N/A'}
- Price per carat: $${diamond.price_per_carat?.toLocaleString() || 'Contact for pricing'}
- Total estimated price: $${totalPrice}
${has360View ? '- 360° Virtual View Available' : ''}

**Additional Details:**
- Polish: ${diamond.polish || 'N/A'}
- Symmetry: ${diamond.symmetry || 'N/A'}
- Fluorescence: ${diamond.fluorescence || 'N/A'}
- Measurements: ${diamond.length}×${diamond.width}×${diamond.depth} mm
- Table: ${diamond.table_percentage}%
- Depth: ${diamond.depth_percentage}%

**Requirements:**
1. Create an emotionally compelling headline that highlights the diamond's most impressive feature
2. Write a captivating description that tells a story and creates desire
3. Highlight the investment value and rarity
4. Include relevant emojis for visual appeal
5. Add a strong call-to-action
6. Format for maximum ${platform} engagement
7. Emphasize any unique selling points (certification, cut quality, rarity, etc.)
${has360View ? '8. Mention the exclusive 360° virtual viewing experience' : ''}

Make this post irresistible to diamond buyers and collectors!`;
}

function generateFallbackPost(diamond: any, platform: string) {
  const has360View = diamond.certificate_url && diamond.certificate_url.includes('v360.in');
  const totalPrice = diamond.price_per_carat && diamond.weight ? 
    (diamond.price_per_carat * diamond.weight).toLocaleString() : 'Contact for pricing';

  return `💎 STUNNING ${diamond.shape?.toUpperCase() || 'DIAMOND'} AVAILABLE NOW! ✨

🔹 ${diamond.weight || '?'} Carat ${diamond.shape || 'Diamond'}
🔹 Color: ${diamond.color || 'N/A'} | Clarity: ${diamond.clarity || 'N/A'}
🔹 Cut: ${diamond.cut || 'N/A'} | Certificate: ${diamond.certificate_number || 'N/A'}
🔹 Lab Certified: ${diamond.lab || 'N/A'}

💰 Price: $${diamond.price_per_carat?.toLocaleString() || 'Contact'}/ct
💵 Total: $${totalPrice}

✨ This exceptional diamond offers incredible brilliance and fire, perfect for that special moment or investment portfolio.

${has360View ? '🎥 Experience this diamond in stunning 360° virtual reality - see every facet in perfect detail!\n' : ''}

📞 Contact us now to secure this rare gem before it's gone!
📱 Stock #: ${diamond.stock_number || 'N/A'}

#Diamond #Luxury #Investment #Engagement #Wedding #Jewelry #Certified${diamond.shape ? ` #${diamond.shape}Diamond` : ''}`;
}

async function storeGeneratedPost(post: any) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        telegram_id: post.telegram_id,
        message_type: 'generated_post',
        message_content: post.post_content.substring(0, 500) + '...',
        metadata: {
          full_post: post.post_content,
          diamond_data: post.diamond_data,
          platform: post.platform,
          generated_at: post.created_at
        },
        status: 'sent'
      }]);

    if (error) {
      console.error('❌ Error storing post:', error);
    } else {
      console.log('✅ Post stored successfully');
    }
  } catch (error) {
    console.error('❌ Error in storeGeneratedPost:', error);
  }
}