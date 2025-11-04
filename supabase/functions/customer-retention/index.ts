import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders } from "../_shared/cors.ts";

interface RetentionRequest {
  segment?: 'onboarding' | 'no_inventory' | 'with_inventory' | 'all';
  test_mode?: boolean;
  days_since_signup?: number; // For onboarding messages (1-4 days)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { segment = 'all', test_mode = false, days_since_signup = 1 } = await req.json() as RetentionRequest;

    console.log(`🎯 Starting customer retention campaign - Segment: ${segment}, Test Mode: ${test_mode}`);

    // Get bot token
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured');
    }

    // Get FastAPI credentials
    const backendToken = Deno.env.get('FASTAPI_BEARER_TOKEN') || Deno.env.get('BACKEND_ACCESS_TOKEN');
    const backendUrl = Deno.env.get('BACKEND_URL') || 'https://api.mazalbot.com';

    // Get admin ID for test mode
    const { data: adminSettings } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_telegram_id')
      .single();

    const adminId = adminSettings?.setting_value || 2138564172;

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('telegram_id, first_name, last_name, created_at');

    if (usersError) throw usersError;

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    const results: any[] = [];

    for (const user of users || []) {
      // Test mode: only process admin
      if (test_mode && user.telegram_id !== adminId) {
        continue;
      }

      try {
        // Check subscription status via FastAPI
        let subscriptionData: any = { is_active: false, subscription_type: 'none' };
        
        if (backendToken) {
          const subResponse = await fetch(`${backendUrl}/api/v1/user/active-subscription`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${backendToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: user.telegram_id })
          });

          if (subResponse.ok) {
            subscriptionData = await subResponse.json();
          }
        }

        // Check if user has inventory
        const { count: inventoryCount } = await supabase
          .from('inventory')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.telegram_id)
          .is('deleted_at', null);

        const hasInventory = (inventoryCount || 0) > 0;
        const isPaying = subscriptionData.is_active === true;

        // Calculate days since signup
        const daysSinceSignup = Math.floor(
          (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Determine message type and content
        let message = '';
        let shouldSend = false;

        // Segment 1: Onboarding (1-4 days, no inventory)
        if ((segment === 'onboarding' || segment === 'all') && 
            daysSinceSignup >= days_since_signup && 
            daysSinceSignup <= 4 && 
            !hasInventory) {
          shouldSend = true;
          message = `👋 היי ${user.first_name}!\n\n` +
            `שמנו לב שעדיין לא העלית מלאי למערכת 💎\n\n` +
            `העלאת מלאי היא הדרך הטובה ביותר להתחיל לקבל התאמות והצעות מקונים!\n\n` +
            `📤 תוכל להעלות את המלאי שלך בקלות דרך:\n` +
            `• CSV/Excel - מהיר ונוח\n` +
            `• SFTP - אוטומטי מהמערכת שלך\n` +
            `• הוספה ידנית\n\n` +
            `צריך עזרה? אנחנו כאן בשבילך! 🚀`;
        }

        // Segment 2: Paying + No Inventory
        if ((segment === 'no_inventory' || segment === 'all') && 
            isPaying && 
            !hasInventory && 
            daysSinceSignup > 4) {
          shouldSend = true;
          message = `🌟 היי ${user.first_name}!\n\n` +
            `תודה שבחרת במנוי Premium שלנו! 💎\n\n` +
            `שמנו לב שעדיין לא העלית מלאי למערכת.\n` +
            `כדי לנצל את מלוא הפוטנציאל של המנוי שלך, העלה את המלאי והתחל לקבל:\n\n` +
            `✨ התאמות אוטומטיות לקונים\n` +
            `📊 דוחות ואנליזות מתקדמות\n` +
            `🎯 הצעות ממוקדות\n` +
            `💰 חשיפה מקסימלית במערכת\n\n` +
            `העלה מלאי עכשיו וקבל את התוצאות! 🚀\n\n` +
            `צריך עזרה? צור איתנו קשר בכל עת.`;
        }

        // Segment 3: Paying + Has Inventory (Daily Report)
        if ((segment === 'with_inventory' || segment === 'all') && 
            isPaying && 
            hasInventory) {
          // Get notification count for last 24 hours
          const { count: notificationCount } = await supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_telegram_id', user.telegram_id)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

          // Get recent matches
          const { data: recentMatches } = await supabase
            .from('notifications')
            .select('message, created_at')
            .eq('user_telegram_id', user.telegram_id)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(5);

          shouldSend = true;
          message = `📊 דוח יומי - ${user.first_name}\n\n` +
            `💎 **סטטיסטיקות ל-24 שעות אחרונות:**\n` +
            `• ${notificationCount || 0} התראות חדשות\n` +
            `• ${inventoryCount || 0} יהלומים במלאי\n` +
            `• מנוי: ${subscriptionData.subscription_type || 'Premium'}\n\n`;

          if (recentMatches && recentMatches.length > 0) {
            message += `🎯 **התאמות אחרונות:**\n`;
            recentMatches.forEach((match, idx) => {
              message += `${idx + 1}. ${match.message?.substring(0, 60)}...\n`;
            });
          } else {
            message += `📭 לא היו התאמות חדשות ב-24 השעות האחרונות.\n`;
          }

          message += `\n✨ המשך את היום בהצלחה!`;
        }

        // Send message if applicable
        if (shouldSend && message) {
          const telegramResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: user.telegram_id,
                text: message,
                parse_mode: 'Markdown'
              })
            }
          );

          if (telegramResponse.ok) {
            successCount++;
            console.log(`✅ Message sent to ${user.telegram_id}`);
            
            // Log to retention_campaigns table
            await supabase.from('retention_campaigns').insert({
              user_telegram_id: user.telegram_id,
              campaign_type: segment,
              message_content: message,
              is_paying: isPaying,
              has_inventory: hasInventory,
              days_since_signup: daysSinceSignup,
              sent_at: new Date().toISOString()
            });

            results.push({
              user_id: user.telegram_id,
              status: 'sent',
              segment: segment,
              is_paying: isPaying,
              has_inventory: hasInventory
            });
          } else {
            const errorText = await telegramResponse.text();
            console.error(`❌ Failed to send to ${user.telegram_id}: ${errorText}`);
            errorCount++;
            results.push({
              user_id: user.telegram_id,
              status: 'failed',
              error: errorText
            });
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        processedCount++;
      } catch (error) {
        console.error(`❌ Error processing user ${user.telegram_id}:`, error);
        errorCount++;
        results.push({
          user_id: user.telegram_id,
          status: 'error',
          error: String(error)
        });
      }
    }

    // Send summary to admin
    const summaryMessage = `📊 **Customer Retention Campaign Complete**\n\n` +
      `Segment: ${segment}\n` +
      `Processed: ${processedCount}\n` +
      `✅ Sent: ${successCount}\n` +
      `❌ Failed: ${errorCount}\n` +
      `Test Mode: ${test_mode ? 'Yes' : 'No'}`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminId,
        text: summaryMessage,
        parse_mode: 'Markdown'
      })
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        sent: successCount,
        failed: errorCount,
        results: results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Customer retention error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
