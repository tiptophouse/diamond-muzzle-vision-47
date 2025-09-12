import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface TelegramInitData {
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  };
  auth_date: number;
  hash: string;
}

interface JWTPayload {
  user_id: number;
  telegram_id: number;
  first_name: string;
  iat: number;
  exp: number;
}

// HMAC-SHA256 verification using Web Crypto API
async function verifyTelegramInitData(initData: string, botToken: string): Promise<boolean> {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      console.error('No hash found in initData');
      return false;
    }

    // Remove hash from params for verification
    urlParams.delete('hash');
    
    // Sort parameters alphabetically and create data-check-string
    const sortedParams = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    console.log('Data check string:', sortedParams);

    // Create secret key using HMAC-SHA256(bot_token, "WebAppData")
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode('WebAppData'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const tokenKey = await crypto.subtle.sign(
      'HMAC',
      secretKey,
      encoder.encode(botToken)
    );

    // Verify the hash using the derived key
    const verifyKey = await crypto.subtle.importKey(
      'raw',
      tokenKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const computedHash = await crypto.subtle.sign(
      'HMAC',
      verifyKey,
      encoder.encode(sortedParams)
    );

    // Convert computed hash to hex string
    const computedHashHex = Array.from(new Uint8Array(computedHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = computedHashHex === hash;
    console.log('Hash verification result:', isValid);
    
    return isValid;
  } catch (error) {
    console.error('Error verifying Telegram initData:', error);
    return false;
  }
}

// Generate JWT token
async function generateJWT(payload: JWTPayload, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const encoder = new TextEncoder();
  
  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  
  const data = `${encodedHeader}.${encodedPayload}`;
  
  // Create signature
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return `${data}.${encodedSignature}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { init_data } = await req.json();
    
    if (!init_data) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing init_data parameter' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get bot token from environment
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not found in environment');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse initData
    const urlParams = new URLSearchParams(init_data);
    const userParam = urlParams.get('user');
    const authDate = urlParams.get('auth_date');
    const hash = urlParams.get('hash');

    if (!userParam || !authDate || !hash) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid initData format' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate timestamp (within 5 minutes)
    const authDateTime = parseInt(authDate) * 1000;
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    if (now - authDateTime > maxAge) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'InitData expired',
          security_info: {
            timestamp_valid: false,
            age_seconds: (now - authDateTime) / 1000
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify HMAC-SHA256 signature
    const isValidSignature = await verifyTelegramInitData(init_data, botToken);
    
    if (!isValidSignature) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid signature',
          security_info: {
            signature_valid: false,
            timestamp_valid: true,
            age_seconds: (now - authDateTime) / 1000
          }
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse user data
    const userData = JSON.parse(decodeURIComponent(userParam));
    
    if (!userData.id || !userData.first_name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid user data' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store/update user profile
    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert({
        telegram_id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        language_code: userData.language_code || 'en',
        is_premium: userData.is_premium || false,
        photo_url: userData.photo_url,
        status: 'active',
        last_active: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'telegram_id'
      });

    if (upsertError) {
      console.error('Error upserting user profile:', upsertError);
    }

    // Generate JWT token
    const jwtSecret = Deno.env.get('JWT_SECRET') || 'fallback-secret-key';
    const payload: JWTPayload = {
      user_id: userData.id,
      telegram_id: userData.id,
      first_name: userData.first_name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const jwtToken = await generateJWT(payload, jwtSecret);

    console.log('✅ Telegram initData verified successfully for user:', userData.first_name);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userData.id,
        user_data: userData,
        jwt_token: jwtToken,
        security_info: {
          timestamp_valid: true,
          age_seconds: (now - authDateTime) / 1000,
          signature_valid: true,
          replay_protected: true
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in verify-telegram-initdata function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});