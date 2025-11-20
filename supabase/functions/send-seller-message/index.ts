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

    console.log('📤 Sending diamond cards to buyer:', {
      telegram_id,
      message_length: message?.length,
      stocks_count: diamond_stocks?.length || 0,
      seller_telegram_id,
      seller_username
    });

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_BOT_USERNAME = Deno.env.get('TELEGRAM_BOT_USERNAME');
    
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

    // First send the AI-generated message as a standalone text
    if (message) {
      const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(telegramApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegram_id,
          text: message,
          parse_mode: 'HTML'
        }),
      });
      console.log('✅ AI message sent');
    }

    let result;
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
          result = { result: { message_id: cardResult.messageId } };
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
        message_id: result.result.message_id
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
