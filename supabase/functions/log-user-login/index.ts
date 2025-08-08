import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoginRequest {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  init_data_hash?: string;
}

function getClientIP(req: Request): string | null {
  // Try multiple headers to get the real client IP
  const forwardedFor = req.headers.get('X-Forwarded-For');
  const realIP = req.headers.get('X-Real-IP');
  const cfConnectingIP = req.headers.get('CF-Connecting-IP');
  const xClientIP = req.headers.get('X-Client-IP');
  
  // X-Forwarded-For can contain multiple IPs, get the first one (original client)
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }
  
  // Try other headers
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (xClientIP) return xClientIP;
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📝 User login logging request received');
    
    const body = await req.json().catch(() => ({}));
    const loginData: LoginRequest = body;
    
    if (!loginData.telegram_id) {
      console.error('❌ Missing telegram_id in login data');
      return new Response(
        JSON.stringify({ error: 'telegram_id is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract IP address from request headers
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('User-Agent');
    
    console.log('🌐 Client IP detected:', clientIP);
    console.log('👤 Logging login for user:', loginData.telegram_id, loginData.first_name);

    // Insert login record with IP address
    const { data, error } = await supabase
      .from('user_logins')
      .insert({
        telegram_id: loginData.telegram_id,
        first_name: loginData.first_name,
        last_name: loginData.last_name,
        username: loginData.username,
        language_code: loginData.language_code,
        is_premium: loginData.is_premium || false,
        photo_url: loginData.photo_url,
        ip_address: clientIP,
        user_agent: userAgent,
        init_data_hash: loginData.init_data_hash,
        login_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Error inserting login record:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to log login' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Login logged successfully for user:', loginData.telegram_id);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Login logged successfully',
        ip_address: clientIP,
        timestamp: new Date().toISOString()
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error in log-user-login function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});