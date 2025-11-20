import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendDiamondCard, DiamondCardData, DiamondCardOptions } from '../_shared/diamond-card-template.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegram_id, message, diamond_images, diamond_stocks, seller_telegram_id, seller_username } = await req.json();

    console.log('📤 Sending enhanced diamond cards to buyer:', {
      telegram_id,
      message_length: message?.length,
      stocks_count: diamond_stocks?.length || 0,
      seller_telegram_id,
      seller_username
    });

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_BOT_USERNAME = Deno.env.get('TELEGRAM_BOT_USERNAME');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }
    
    if (!TELEGRAM_BOT_USERNAME) {
      throw new Error('TELEGRAM_BOT_USERNAME not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch diamond details for AI enhancement
    const diamondDetails = [];
    if (diamond_stocks && diamond_stocks.length > 0) {
      for (const stock of diamond_stocks.slice(0, 4)) {
        const { data: diamond } = await supabase
          .from('inventory')
          .select('*')
          .eq('stock_number', stock)
          .single();
        
        if (diamond) {
          diamondDetails.push(diamond);
        }
      }
    }

    // Use AI to generate a rich, well-formatted intro message
    let enhancedMessage = message;
    if (LOVABLE_API_KEY && diamondDetails.length > 0) {
      try {
        console.log('🤖 Generating AI-enhanced message...');
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `You are an expert diamond dealer crafting personalized messages to buyers. 
Create a warm, professional message that:
- Uses proper paragraphs (2-3 sentences each)
- Highlights the key features that make these diamonds special
- Creates excitement about the opportunity
- Is concise but engaging
- Uses Hebrew/English mix naturally
- Ends with a call to action

Format with HTML tags: <b>bold</b>, <i>italic</i>, line breaks, but keep it clean and readable.`
              },
              {
                role: 'user',
                content: `Create a personalized message for a buyer about these ${diamondDetails.length} diamonds:

${diamondDetails.map((d, i) => `
Diamond ${i + 1}:
- ${d.weight}ct ${d.shape}
- ${d.color} color, ${d.clarity} clarity
- ${d.cut} cut
- Price: $${(d.price_per_carat * d.weight).toLocaleString()}
`).join('\n')}

Total value: $${diamondDetails.reduce((sum, d) => sum + (d.price_per_carat * d.weight), 0).toLocaleString()}

Original message context: ${message || 'מצאנו עבורך יהלומים מתאימים'}

Make it personal, engaging, and professional. Use 2-3 short paragraphs.`
              }
            ]
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          enhancedMessage = aiData.choices[0].message.content;
          console.log('✅ AI-enhanced message generated');
        }
      } catch (aiError) {
        console.warn('⚠️ AI enhancement failed, using original message:', aiError);
      }
    }

    // Send the enhanced intro message with proper formatting
    if (enhancedMessage) {
      const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(telegramApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegram_id,
          text: enhancedMessage,
          parse_mode: 'HTML'
        }),
      });
      console.log('✅ Enhanced intro message sent');
    }

    const messageIds: number[] = [];

    // Send each diamond as a beautiful card
    if (diamond_stocks && diamond_stocks.length > 0) {
      console.log('💎 Sending diamond cards:', diamond_stocks.length);
      
      for (const stock of diamond_stocks.slice(0, 4)) {
        // Fetch diamond data from inventory
        const { data: diamond, error: diamondError } = await supabase
          .from('inventory')
          .select('*')
          .eq('stock_number', stock)
          .single();

        if (diamondError || !diamond) {
          console.error('❌ Diamond not found:', stock);
          continue;
        }

        // Build diamond card data
        const diamondData: DiamondCardData = {
          id: diamond.id,
          stock_number: diamond.stock_number,
          shape: diamond.shape,
          weight: diamond.weight,
          color: diamond.color,
          clarity: diamond.clarity,
          cut: diamond.cut || 'N/A',
          price_per_carat: diamond.price_per_carat,
          picture: diamond.picture,
          gem360_url: diamond.gem360_url,
        };

        // Build contact button
        const additionalButtons = [];
        if (seller_telegram_id || seller_username) {
          const contactUrl = seller_username 
            ? `https://t.me/${seller_username}`
            : `tg://user?id=${seller_telegram_id}`;
          
          additionalButtons.push({
            text: '📞 צור קשר עם המוכר',
            url: contactUrl
          });
        }

        // Send diamond card
        const cardResult = await sendDiamondCard(
          Number(telegram_id),
          diamondData,
          {
            context: 'offer',
            sharedById: seller_telegram_id,
            additionalButtons: additionalButtons,
            includeStoreButton: true,
            botUsername: TELEGRAM_BOT_USERNAME,
          }
        );

        if (cardResult.success && cardResult.messageId) {
          messageIds.push(cardResult.messageId);
        } else {
          console.error('⚠️ Failed to send diamond card:', cardResult.error);
        }

        // Small delay between cards to avoid rate limits
        if (diamond_stocks.indexOf(stock) < diamond_stocks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      console.log('✅ All diamond cards sent:', messageIds.length);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message_ids: messageIds,
        cards_sent: messageIds.length
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Error in send-seller-message:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
