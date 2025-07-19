
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Admin notification function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, message, target, specificUserId, type } = await req.json();
    console.log('📥 Admin notification request:', { title, target, type, hasSpecificUserId: !!specificUserId });
    
    if (!title || !message) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required title or message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!botToken || !supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get target users based on selection
    let targetUsers = [];
    
    if (target === 'specific' && specificUserId) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name')
        .eq('telegram_id', specificUserId)
        .single();
      
      if (error || !data) {
        console.error('❌ User not found:', error);
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      targetUsers = [data];
    } else if (target === 'all') {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name')
        .eq('status', 'active');
      
      if (error) {
        console.error('❌ Error fetching users:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      targetUsers = data || [];
    } else if (target === 'premium') {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('telegram_id, first_name, last_name')
        .eq('is_premium', true)
        .eq('status', 'active');
      
      if (error) {
        console.error('❌ Error fetching premium users:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch premium users' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      targetUsers = data || [];
    }

    console.log(`📤 Sending to ${targetUsers.length} users`);
    
    const results = [];
    const uploadUrl = `${Deno.env.get('SUPABASE_URL')?.replace('uhhljqgxhdhbbhpohxll.supabase.co', 'your-app-domain.com') || 'https://your-app-domain.com'}/upload?action=scan`;
    
    // Send messages with rate limiting (1 message per second to avoid Telegram limits)
    for (let i = 0; i < targetUsers.length; i++) {
      const user = targetUsers[i];
      
      try {
        // If this is an upload reminder, use the enhanced message format
        let finalMessage = message;
        if (type === 'upload_reminder') {
          finalMessage = `🔍 **${title}**

שלום ${user.first_name || 'חבר'}! 👋

${message}

🚀 **Start uploading:** [Upload Certificate](${uploadUrl})

Need help? Reply to this message and we'll guide you through the process.

**Happy Diamond Trading!** 💎`;
        } else {
          finalMessage = `📢 **${title}**

${message}`;
        }
        
        const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: user.telegram_id,
            text: finalMessage,
            parse_mode: 'Markdown',
            disable_web_page_preview: false
          }),
        });

        const result = await telegramResponse.json();
        
        if (telegramResponse.ok) {
          results.push({ telegram_id: user.telegram_id, success: true, messageId: result.result.message_id });
          console.log(`✅ Message sent to ${user.telegram_id}`);
        } else {
          results.push({ telegram_id: user.telegram_id, success: false, error: result.description });
          console.error(`❌ Failed to send to ${user.telegram_id}:`, result.description);
        }
        
        // Save notification to database
        await supabase
          .from('notifications')
          .insert({
            telegram_id: user.telegram_id,
            message_type: type || 'admin_notification',
            message_content: finalMessage,
            status: telegramResponse.ok ? 'delivered' : 'failed',
            metadata: {
              title,
              sent_by: 'admin',
              target_type: target,
              notification_type: type
            }
          });
        
        // Rate limiting: wait 1 second between messages to avoid Telegram API limits
        if (i < targetUsers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ Error sending to ${user.telegram_id}:`, error);
        results.push({ telegram_id: user.telegram_id, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    console.log(`✅ Notification completed: ${successCount} sent, ${failureCount} failed`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        failed: failureCount,
        results: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in admin notification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
