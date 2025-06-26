
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-user-id',
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method, endpoint, data, telegramUserId } = await req.json();
    
    console.log('🔐 SECURE PROXY: Request for user:', telegramUserId, 'Endpoint:', endpoint);

    if (!telegramUserId) {
      throw new Error('Telegram user ID is required');
    }

    // Get the hardcoded FastAPI token from Supabase secrets
    const FASTAPI_TOKEN = Deno.env.get('FASTAPI_BEARER_TOKEN');
    
    if (!FASTAPI_TOKEN) {
      console.error('❌ FASTAPI_BEARER_TOKEN not configured in Supabase secrets');
      throw new Error('FastAPI authentication not configured');
    }

    // Make the FastAPI request with the secure token
    const fastApiUrl = `https://api.mazalbot.com${endpoint}`;
    console.log('🚀 SECURE PROXY: Making FastAPI request to:', fastApiUrl);

    const requestOptions: RequestInit = {
      method: method || 'GET',
      headers: {
        'Authorization': `Bearer ${FASTAPI_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Telegram-User-ID': telegramUserId.toString()
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(fastApiUrl, requestOptions);
    
    if (!response.ok) {
      console.error('❌ SECURE PROXY: FastAPI request failed:', response.status, response.statusText);
      throw new Error(`FastAPI request failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ SECURE PROXY: FastAPI request successful for user:', telegramUserId);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ SECURE PROXY: Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Proxy request failed' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
