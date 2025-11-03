import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stock_numbers } = await req.json();

    console.log('📡 Fetching diamonds from FastAPI:', stock_numbers?.length || 'all');

    // Get FastAPI token from Supabase secrets
    const FASTAPI_BEARER_TOKEN = Deno.env.get('FASTAPI_BEARER_TOKEN');
    if (!FASTAPI_BEARER_TOKEN) {
      throw new Error('FASTAPI_BEARER_TOKEN not configured');
    }

    // Fetch all stones from FastAPI
    const response = await fetch('https://api.mazalbot.com/api/v1/get_all_stones', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FASTAPI_BEARER_TOKEN}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FastAPI error:', response.status, errorText);
      throw new Error(`FastAPI error: ${response.status}`);
    }

    const allDiamonds = await response.json();
    console.log('✅ Fetched diamonds from FastAPI:', allDiamonds.length);

    // Filter by stock numbers if provided
    let filteredDiamonds = allDiamonds;
    if (stock_numbers && Array.isArray(stock_numbers) && stock_numbers.length > 0) {
      filteredDiamonds = allDiamonds.filter((d: any) => 
        stock_numbers.includes(d.stock_number || d.stock)
      );
      console.log('🔍 Filtered to requested diamonds:', filteredDiamonds.length);
    }

    return new Response(
      JSON.stringify({ 
        diamonds: filteredDiamonds,
        total: filteredDiamonds.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error fetching diamonds:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch diamonds',
        diamonds: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
