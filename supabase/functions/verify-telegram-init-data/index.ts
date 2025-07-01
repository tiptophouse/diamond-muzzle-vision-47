
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyTelegramInitData(initData: string): Promise<{ valid: boolean; user?: any; error?: string }> {
  try {
    if (!botToken) {
      return { valid: false, error: 'Bot token not configured' };
    }

    // Parse the initData
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    const authDate = urlParams.get('auth_date');
    
    if (!hash || !authDate) {
      return { valid: false, error: 'Missing required parameters' };
    }

    // Check if the data is not too old (24 hours as per Telegram specs)
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (now - authDateTime > maxAge) {
      return { valid: false, error: 'InitData is too old' };
    }

    // Create the data string for verification
    const params = new URLSearchParams(initData);
    params.delete('hash'); // Remove hash for verification
    
    // Sort parameters and create verification string
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create HMAC
    const secretKey = new TextEncoder().encode('WebAppData');
    const botTokenKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(botToken),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const secretKeyHash = await crypto.subtle.sign('HMAC', botTokenKey, secretKey);
    
    const hmacKey = await crypto.subtle.importKey(
      'raw',
      secretKeyHash,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', hmacKey, new TextEncoder().encode(sortedParams));
    const computedHash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Verify the hash
    if (computedHash !== hash) {
      return { valid: false, error: 'Invalid signature' };
    }

    // Parse user data
    const userParam = urlParams.get('user');
    if (!userParam) {
      return { valid: false, error: 'No user data found' };
    }

    const user = JSON.parse(decodeURIComponent(userParam));
    
    // Validate required user fields
    if (!user.id || !user.first_name) {
      return { valid: false, error: 'Invalid user data structure' };
    }

    console.log('✅ Telegram initData verified successfully for user:', user.id);
    
    return { valid: true, user };
  } catch (error) {
    console.error('❌ InitData verification error:', error);
    return { valid: false, error: 'Verification failed' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { initData } = await req.json();
    
    if (!initData) {
      return new Response(
        JSON.stringify({ error: 'InitData is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔐 Verifying Telegram initData...');
    
    const result = await verifyTelegramInitData(initData);
    
    if (!result.valid) {
      console.log('❌ InitData verification failed:', result.error);
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store/update user profile
    if (result.user) {
      try {
        const { error: upsertError } = await supabase
          .from('user_profiles')
          .upsert({
            telegram_id: result.user.id,
            first_name: result.user.first_name,
            last_name: result.user.last_name || null,
            username: result.user.username || null,
            language_code: result.user.language_code || 'en',
            is_premium: result.user.is_premium || false,
            photo_url: result.user.photo_url || null,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'telegram_id'
          });

        if (upsertError) {
          console.error('❌ Failed to update user profile:', upsertError);
        } else {
          console.log('✅ User profile updated successfully');
        }
      } catch (profileError) {
        console.error('❌ Profile update error:', profileError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: result.user,
        verified: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Verification endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
