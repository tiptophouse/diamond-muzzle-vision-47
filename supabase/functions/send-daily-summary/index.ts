import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DailySummaryRequest {
  telegramId: number;
  forceRun?: boolean;
}

serve(async (req) => {
  console.log('📊 Daily summary function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { telegramId, forceRun = false }: DailySummaryRequest = await req.json();
    
    console.log('📥 Request data:', { telegramId, forceRun });

    if (!telegramId) {
      console.error('❌ Missing telegramId');
      return new Response(
        JSON.stringify({ error: 'Missing telegramId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get today's notifications for the user
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Fetching notifications for date:', today);

    const { data: notifications, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('telegram_id', telegramId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T00:00:00.000Z`)
      .order('created_at', { ascending: false });

    if (notificationError) {
      console.error('❌ Error fetching notifications:', notificationError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch notifications' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${notifications?.length || 0} notifications for today`);

    if (!notifications || notifications.length === 0) {
      console.log('ℹ️ No notifications to summarize');
      return new Response(
        JSON.stringify({ message: 'No notifications for today', sent: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if summary was already sent today (unless forced)
    if (!forceRun) {
      const { data: existingSummary } = await supabase
        .from('daily_summaries')
        .select('id')
        .eq('telegram_id', telegramId)
        .eq('summary_date', today)
        .maybeSingle();

      if (existingSummary) {
        console.log('ℹ️ Summary already sent today');
        return new Response(
          JSON.stringify({ message: 'Summary already sent today', sent: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate summary message
    const totalNotifications = notifications.length;
    const diamondMatches = notifications.filter(n => n.message_type === 'diamond_match').length;
    const searchResults = notifications.filter(n => n.message_type === 'search_result').length;
    
    // Group notifications by diamonds
    const diamondData: any[] = [];
    notifications.forEach(notification => {
      if (notification.metadata?.matches) {
        diamondData.push(...notification.metadata.matches);
      }
    });

    // Get unique diamonds by stock number
    const uniqueDiamonds = diamondData.reduce((acc, diamond) => {
      if (!acc[diamond.stock_number]) {
        acc[diamond.stock_number] = diamond;
      }
      return acc;
    }, {});

    const totalUniqueMatches = Object.keys(uniqueDiamonds).length;

    // Create summary message
    const summaryMessage = `📊 *סיכום יומי - ${new Date().toLocaleDateString('he-IL')}*

🔔 *סך הכל התראות:* ${totalNotifications}
💎 *התאמות יהלומים:* ${diamondMatches}
🔍 *תtulp חיפושים:* ${searchResults}
💍 *יהלומים ייחודיים שהותאמו:* ${totalUniqueMatches}

${totalUniqueMatches > 0 ? `*🌟 היהלומים הפופולריים ביותר היום:*\n${Object.values(uniqueDiamonds).slice(0, 3).map((diamond: any, index) => 
  `${index + 1}. מלאי #${diamond.stock_number} - ${diamond.shape} ${diamond.weight}ct ${diamond.color}/${diamond.clarity}${diamond.total_price ? ` - $${diamond.total_price.toLocaleString()}` : ''}`
).join('\n')}\n` : ''}

${diamondMatches > 0 ? `🎯 *לקוחות מעוניינים ביהלומים שלך!*\nלחץ כדי לראות את כל ההתאמות ולצור קשר עם לקוחות פוטנציאליים.` : ''}

_💡 טיפ: התחבר לדשבורד כדי לנהל את המלאי ולצור קשר עם לקוחות מעוניינים._`;

    // Send the summary message
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('❌ Bot token not configured');
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const appUrl = Deno.env.get('WEBAPP_URL') || 'https://miniapp.mazalbot.com';
    const messagePayload = {
      chat_id: telegramId,
      text: summaryMessage,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📱 פתח דשבורד',
              web_app: { url: `${appUrl}?startapp=dashboard` }
            }
          ],
          [
            {
              text: '💎 חנות היהלומים',
              web_app: { url: `${appUrl}?startapp=store` }
            }
          ],
          diamondMatches > 0 ? [
            {
              text: '🔔 צפה בהתראות',
              web_app: { url: `${appUrl}?startapp=notifications` }
            }
          ] : []
        ].filter(row => row.length > 0)
      }
    };

    console.log('📤 Sending daily summary to Telegram API...');
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messagePayload),
    });

    const result = await telegramResponse.json();
    console.log('📨 Telegram API response status:', telegramResponse.status);
    
    if (!telegramResponse.ok) {
      console.error('❌ Telegram API error:', result);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send summary', 
          telegram_error: result 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save summary record to prevent duplicate sends
    const { error: summaryError } = await supabase
      .from('daily_summaries')
      .insert({
        telegram_id: telegramId,
        summary_date: today,
        notifications_count: totalNotifications,
        diamond_matches: diamondMatches,
        unique_diamonds: totalUniqueMatches,
        message_id: result.result.message_id,
        summary_data: {
          notifications: notifications.map(n => ({
            id: n.id,
            type: n.message_type,
            created_at: n.created_at
          })),
          unique_diamonds: Object.values(uniqueDiamonds)
        }
      });

    if (summaryError) {
      console.error('⚠️ Failed to save summary record:', summaryError);
      // Don't fail the request, just log the error
    }

    console.log('✅ Daily summary sent successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.result.message_id,
        summaryData: {
          totalNotifications,
          diamondMatches,
          uniqueDiamonds: totalUniqueMatches
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error sending daily summary:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});