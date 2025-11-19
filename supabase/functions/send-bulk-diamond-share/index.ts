import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiamondShareRequest {
  diamond: {
    id: string;
    stockNumber: string;
    carat: number;
    shape: string;
    color: string;
    clarity: string;
    cut: string;
    price: number;
    imageUrl?: string;
    gem360Url?: string;
  };
  message: string;
  sharedBy: number;
  sharedByName: string;
  users: any[];
  testMode: boolean;
}

serve(async (req) => {
  console.log('🚀 Bulk diamond share function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diamond, message, sharedBy, sharedByName, users, testMode }: DiamondShareRequest = await req.json();
    
    console.log('📥 Request data:', { 
      diamondStock: diamond.stockNumber,
      sharedBy,
      usersCount: users.length,
      testMode
    });

    if (!diamond || !message || !sharedBy) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get admin telegram ID
    const { data: adminSettings } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_telegram_id')
      .single();

    let adminTelegramId = 2138564172; // fallback
    
    if (adminSettings?.setting_value) {
      const settingValue = adminSettings.setting_value;
      if (typeof settingValue === 'number') {
        adminTelegramId = settingValue;
      } else if (typeof settingValue === 'object' && settingValue.value) {
        adminTelegramId = parseInt(settingValue.value);
      } else if (typeof settingValue === 'object' && settingValue.admin_telegram_id) {
        adminTelegramId = parseInt(settingValue.admin_telegram_id);
      } else if (typeof settingValue === 'string') {
        adminTelegramId = parseInt(settingValue);
      }
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('❌ Bot token not configured');
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;

    // Create inline keyboard with diamond viewing options
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '💎 View Diamond Details',
              web_app: {
                url: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/diamond/${diamond.id}?shared=true&from=${sharedBy}`
              }
            }
          ],
          [
            {
              text: '📞 Contact Seller',
              callback_data: `contact_seller_${diamond.stockNumber}_${sharedBy}`
            }
          ]
        ]
      }
    };

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // If test mode, send only to admin
    if (testMode) {
      console.log(`📧 Sending test diamond share to admin: ${adminTelegramId}`);
      
      try {
        const testMessage = `🧪 **Test Diamond Share**\n\n${message}\n\n*This would be sent to ${users.length} users*`;
        
        const response = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminTelegramId,
            text: testMessage,
            parse_mode: 'Markdown',
            ...inlineKeyboard
          })
        });

        const result = await response.json();
        
        if (result.ok) {
          successCount++;
          console.log('✅ Test diamond share sent to admin successfully');
        } else {
          errorCount++;
          errors.push(`Admin test: ${result.description}`);
          console.error('❌ Failed to send test diamond share to admin:', result);
        }
      } catch (error) {
        errorCount++;
        errors.push(`Admin test error: ${error.message}`);
        console.error('❌ Error sending test diamond share to admin:', error);
      }
    } else {
      // Send to all users
      console.log(`📧 Sending diamond share to ${users.length} users`);
      
      for (const user of users) {
        try {
          const personalizedMessage = `Hi ${user.first_name || 'there'}! 👋\n\n${message}`;
          
          const response = await fetch(`${telegramApiUrl}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.telegram_id,
              text: personalizedMessage,
              parse_mode: 'Markdown',
              ...inlineKeyboard
            })
          });

          const result = await response.json();
          
          if (result.ok) {
            successCount++;
            console.log(`✅ Diamond share sent to ${user.first_name} (${user.telegram_id})`);
            
            // Track the share in analytics
            try {
              await supabase.from('diamond_share_analytics').insert({
                diamond_stock_number: diamond.stockNumber,
                owner_telegram_id: sharedBy,
                viewer_telegram_id: user.telegram_id,
                action_type: 'bulk_share_sent',
                session_id: crypto.randomUUID(),
                access_via_share: true,
                analytics_data: {
                  bulk_share: true,
                  share_timestamp: new Date().toISOString(),
                  diamond_data: diamond
                }
              });
            } catch (analyticsError) {
              console.warn('⚠️ Failed to track share analytics:', analyticsError);
            }
            
          } else {
            errorCount++;
            errors.push(`${user.first_name}: ${result.description}`);
            console.error(`❌ Failed to send diamond share to ${user.first_name}:`, result);
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 150));
        } catch (error) {
          errorCount++;
          errors.push(`${user.first_name}: ${error.message}`);
          console.error(`❌ Error sending diamond share to ${user.first_name}:`, error);
        }
      }

      // Send confirmation to admin
      try {
        const adminMessage = `💎 **Bulk Diamond Share Complete!**

**Diamond:** ${diamond.carat}ct ${diamond.shape}
**Stock:** ${diamond.stockNumber}
**Price:** $${diamond.price.toLocaleString()}

**Results:**
✅ Successfully sent: ${successCount}
❌ Failed: ${errorCount}

**Shared by:** ${sharedByName} (${sharedBy})

The diamond sharing campaign has been completed!`;
        
        const response = await fetch(`${telegramApiUrl}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminTelegramId,
            text: adminMessage,
            parse_mode: 'Markdown'
          })
        });

        const result = await response.json();
        if (result.ok) {
          console.log('✅ Confirmation sent to admin');
        }
      } catch (error) {
        console.error('❌ Error sending confirmation to admin:', error);
      }
    }

    console.log(`📊 Diamond Share Results: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        successCount,
        errorCount,
        errors: errors.slice(0, 10), // Limit errors to first 10
        diamond: diamond,
        message: testMode ? 'Test diamond share sent' : 'Diamond shared to all users'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Bulk diamond share error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to send bulk diamond share'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});