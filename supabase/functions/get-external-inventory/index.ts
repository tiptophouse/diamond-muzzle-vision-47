
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()
    
    // Get backend access token from secrets
    const backendToken = Deno.env.get('BACKEND_ACCESS_TOKEN')
    const backendUrl = Deno.env.get('BACKEND_URL') || 'https://api.mazalbot.com'
    
    if (!backendToken) {
      console.error('Backend access token not configured')
      return new Response(
        JSON.stringify({ error: 'Backend access token not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('🌐 Fetching external inventory for user:', user_id)
    
    const response = await fetch(`${backendUrl}/api/v1/get_all_stones?user_id=${user_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${backendToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`External API failed: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ External inventory fetched:', data?.length || 0, 'items')

    return new Response(
      JSON.stringify(data || []),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ External inventory fetch error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
