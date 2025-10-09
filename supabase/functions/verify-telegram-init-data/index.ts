import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function verifyTelegramInitData(initData: string, botToken: string): Promise<boolean> {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      console.error('❌ No hash in initData');
      return false;
    }
    
    // Remove hash from params for verification
    urlParams.delete('hash');
    
    // Sort params alphabetically and create data check string
    const dataCheckArr = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`);
    const dataCheckString = dataCheckArr.join('\n');
    
    console.log('🔐 Verifying initData with bot token');
    
    // Create secret key from bot token using SHA-256
    const encoder = new TextEncoder();
    const secretKeyData = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(botToken)
    );
    
    const secretKey = await crypto.subtle.importKey(
      'raw',
      secretKeyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Calculate HMAC-SHA256
    const signature = await crypto.subtle.sign(
      'HMAC',
      secretKey,
      encoder.encode(dataCheckString)
    );
    
    // Convert to hex string
    const hexHash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const isValid = hexHash === hash;
    console.log(`🔐 HMAC verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    return isValid;
  } catch (error) {
    console.error('❌ HMAC verification error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { init_data } = await req.json();
    
    if (!init_data) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing init_data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get bot token from secrets
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify HMAC-SHA256 signature
    const isValid = await verifyTelegramInitData(init_data, botToken);
    
    if (!isValid) {
      console.error('❌ SECURITY ALERT: Invalid Telegram signature detected');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid Telegram authentication signature',
          security_alert: true
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify timestamp freshness (within 5 minutes)
    const urlParams = new URLSearchParams(init_data);
    const authDate = urlParams.get('auth_date');
    
    if (authDate) {
      const authDateTime = parseInt(authDate) * 1000;
      const now = Date.now();
      const ageSeconds = (now - authDateTime) / 1000;
      
      if (ageSeconds > 300) { // 5 minutes
        console.warn(`⚠️ InitData is ${ageSeconds}s old (max 300s)`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Authentication data expired',
            age_seconds: ageSeconds
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`✅ Timestamp valid (${ageSeconds}s old)`);
    }

    // Extract user data
    const userParam = urlParams.get('user');
    if (!userParam) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing user data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = JSON.parse(decodeURIComponent(userParam));
    
    console.log('✅ HMAC verification successful for user:', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        user_id: user.id,
        user_data: user,
        security_info: {
          signature_valid: true,
          timestamp_valid: true,
          age_seconds: authDate ? (Date.now() - parseInt(authDate) * 1000) / 1000 : null
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Verification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
