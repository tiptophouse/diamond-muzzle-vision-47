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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { days = 7 } = await req.json().catch(() => ({ days: 7 }));
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - Number(days || 7));

    const { data, error } = await supabase
      .from('group_cta_clicks')
      .select('*')
      .gte('clicked_at', fromDate.toISOString())
      .order('clicked_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching CTA analytics:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch analytics' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clicksByDay: Record<string, number> = {};
    for (const click of data || []) {
      const d = new Date(click.clicked_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      clicksByDay[key] = (clicksByDay[key] || 0) + 1;
    }

    const uniqueUsers = new Set((data || []).map((c: any) => c.telegram_id)).size;

    const payload = {
      totalClicks: data?.length || 0,
      uniqueUsers,
      clicksByDay,
      data: data || [],
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ get-group-cta-analytics error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});