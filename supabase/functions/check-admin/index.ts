import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { telegramId } = await req.json();

    if (!telegramId) {
      return new Response(
        JSON.stringify({ isAdmin: false, role: null, error: 'Missing telegram ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('🔐 Checking admin status for Telegram ID:', telegramId);

    // Query admin_roles with service role (bypasses RLS)
    const { data, error } = await supabase
      .from('admin_roles')
      .select('role, is_active')
      .eq('telegram_id', telegramId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error checking admin status:', error);
      return new Response(
        JSON.stringify({ isAdmin: false, role: null, error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const isAdmin = !!data;
    const role = data?.role || null;

    console.log('✅ Admin check result:', { telegramId, isAdmin, role });

    return new Response(
      JSON.stringify({ isAdmin, role }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('❌ Exception in check-admin:', error);
    return new Response(
      JSON.stringify({ isAdmin: false, role: null, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
