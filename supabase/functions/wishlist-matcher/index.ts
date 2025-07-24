
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Diamond {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  price_per_carat: number;
  user_id: number;
}

interface WishlistCriteria {
  shape?: string;
  color?: string;
  clarity?: string;
  weight_min?: number;
  weight_max?: number;
  price_min?: number;
  price_max?: number;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

async function sendTelegramMessage(chatId: number, message: string, options?: any) {
  if (!telegramBotToken) {
    console.error('Telegram bot token not found');
    return;
  }

  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        ...options
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

function matchesCriteria(diamond: Diamond, criteria: WishlistCriteria): boolean {
  // Check shape
  if (criteria.shape && diamond.shape !== criteria.shape) {
    return false;
  }

  // Check color
  if (criteria.color && diamond.color !== criteria.color) {
    return false;
  }

  // Check clarity
  if (criteria.clarity && diamond.clarity !== criteria.clarity) {
    return false;
  }

  // Check cut
  if (criteria.cut && diamond.cut !== criteria.cut) {
    return false;
  }

  // Check weight range
  if (criteria.weight_min && diamond.weight < criteria.weight_min) {
    return false;
  }
  if (criteria.weight_max && diamond.weight > criteria.weight_max) {
    return false;
  }

  // Check price range (calculate total price)
  const totalPrice = diamond.price_per_carat * diamond.weight;
  if (criteria.price_min && totalPrice < criteria.price_min) {
    return false;
  }
  if (criteria.price_max && totalPrice > criteria.price_max) {
    return false;
  }

  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diamonds, uploaderTelegramId } = await req.json();

    if (!diamonds || !Array.isArray(diamonds)) {
      return new Response(
        JSON.stringify({ error: 'Invalid diamonds data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get all active wishlist items
    const { data: wishlistItems, error: wishlistError } = await supabase
      .from('wishlist')
      .select('*')
      .neq('visitor_telegram_id', uploaderTelegramId); // Don't match uploader's own wishes

    if (wishlistError) {
      console.error('Error fetching wishlist:', wishlistError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch wishlist' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let totalMatches = 0;
    const notifications = [];

    // Check each diamond against each wishlist item
    for (const diamond of diamonds) {
      for (const wishItem of wishlistItems || []) {
        if (matchesCriteria(diamond, wishItem.diamond_data)) {
          totalMatches++;

          // Update wishlist item with matched diamond owner
          await supabase
            .from('wishlist')
            .update({ 
              diamond_owner_telegram_id: uploaderTelegramId,
              diamond_stock_number: diamond.stock_number 
            })
            .eq('id', wishItem.id);

          // Send notification ONLY to diamond owner (uploader)
          const ownerMessage = `💎 <b>יש לך התאמה!</b>

לקוח מחפש יהלום שמתאים בדיוק לאחד היהלומים שלך:

<b>מלאי #${diamond.stock_number}</b>
🔸 צורה: ${diamond.shape}
🔸 משקל: ${diamond.weight} קראט
🔸 צבע: ${diamond.color}
🔸 ניקיון: ${diamond.clarity}
💰 מחיר: $${(diamond.price_per_carat * diamond.weight).toLocaleString()}

⏰ הלקוח הוסיף את המשאלה ב: ${new Date(wishItem.created_at).toLocaleDateString('he-IL')}

👤 פתח צ'אט עם הלקוח כדי לסגור עסקה!`;

          // Store notification only for diamond owner
          await supabase
            .from('notifications')
            .insert([
              {
                telegram_id: uploaderTelegramId,
                message_type: 'wishlist_match_owner',
                message_content: ownerMessage,
                metadata: {
                  diamond_stock_number: diamond.stock_number,
                  buyer_telegram_id: wishItem.visitor_telegram_id,
                  match_type: 'owner_notification'
                }
              }
            ]);

          // Send Telegram message ONLY to diamond owner
          await sendTelegramMessage(uploaderTelegramId, ownerMessage, {
            reply_markup: {
              inline_keyboard: [[
                { text: "פתח צ'אט עם הלקוח", url: `https://t.me/your_bot?start=chat_${wishItem.visitor_telegram_id}` },
                { text: "פתח אפליקציה", url: "https://your-app-url.com" }
              ]]
            }
          });

          notifications.push({
            diamond: diamond.stock_number,
            buyer: wishItem.visitor_telegram_id,
            owner: uploaderTelegramId
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        matches: totalMatches,
        notifications: notifications.length,
        message: totalMatches > 0 
          ? `נמצאו ${totalMatches} התאמות לרשימות משאלות! ההתראות נשלחו לבעלי היהלומים.`
          : 'לא נמצאו התאמות לרשימות משאלות.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Wishlist matcher error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
