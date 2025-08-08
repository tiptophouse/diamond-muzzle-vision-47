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

async function ipToCountry(ip: string) {
  try {
    // Use ipapi.co (no key needed for basic info)
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`IP API error ${res.status}`);
    const data = await res.json();
    return { code: data.country_code || null, name: data.country_name || null };
  } catch (e) {
    // Fallback to ipwho.is
    try {
      const res = await fetch(`https://ipwho.is/${ip}`);
      const data = await res.json();
      if (data?.success) return { code: data.country_code || null, name: data.country || null };
    } catch {}
    return { code: null, name: null };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const telegramIds: number[] = Array.isArray(body.telegram_ids) ? body.telegram_ids : [];
    if (!telegramIds.length) {
      return new Response(JSON.stringify({ results: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get latest IP per user
    const { data, error } = await supabase
      .from('user_logins')
      .select('telegram_id, ip_address, login_timestamp')
      .in('telegram_id', telegramIds)
      .order('login_timestamp', { ascending: false });

    if (error) {
      console.error('❌ Error querying user_logins:', error);
      return new Response(JSON.stringify({ error: 'Query failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Pick latest per telegram_id
    const latestMap = new Map<number, string | null>();
    for (const row of data || []) {
      if (!latestMap.has(row.telegram_id)) {
        latestMap.set(row.telegram_id, row.ip_address || null);
      }
    }

    const uniqueIPs = Array.from(new Set(Array.from(latestMap.values()).filter(Boolean))) as string[];
    const ipCountryMap = new Map<string, { code: string | null; name: string | null }>();

    // Resolve IPs sequentially to be gentle (few users on admin page)
    for (const ip of uniqueIPs) {
      const c = await ipToCountry(ip);
      ipCountryMap.set(ip, c);
    }

    const results = Array.from(latestMap.entries()).map(([telegram_id, ip]) => {
      const c = ip && ipCountryMap.get(ip) || { code: null, name: null };
      return { telegram_id, country_code: c.code, country_name: c.name };
    });

    return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('❌ get-users-country error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});