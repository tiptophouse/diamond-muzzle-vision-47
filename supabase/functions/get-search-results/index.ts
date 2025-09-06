import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get query parameters
    const url = new URL(req.url)
    const userId = url.searchParams.get('user_id')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const resultType = url.searchParams.get('result_type') || 'match'

    console.log('🔍 Get Search Results - params:', { userId, limit, offset, resultType })

    if (!userId) {
      return new Response(JSON.stringify({ error: 'user_id parameter is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Set user context for RLS
    await supabase.rpc('set_session_context', {
      key: 'app.current_user_id',
      value: userId
    })

    // Build query based on result type
    let query = supabase
      .from('match_notifications')
      .select(`
        id,
        buyer_id,
        seller_id,
        diamond_id,
        is_match,
        confidence_score,
        details_json,
        created_at,
        updated_at
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by result type
    if (resultType === 'match') {
      query = query.eq('is_match', true)
    } else if (resultType === 'unmatch') {
      query = query.eq('is_match', false)
    }
    // If resultType is 'all' or anything else, don't filter

    const { data: matchNotifications, error: matchError, count } = await query

    if (matchError) {
      console.error('❌ Match notifications query error:', matchError)
      return new Response(JSON.stringify({ error: 'Failed to fetch search results' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get additional diamond details from inventory
    const diamondIds = matchNotifications?.map(m => m.diamond_id) || []
    let diamondDetails = []

    if (diamondIds.length > 0) {
      const { data: diamonds, error: diamondError } = await supabase
        .from('inventory')
        .select(`
          stock_number,
          shape,
          weight,
          color,
          clarity,
          cut,
          polish,
          symmetry,
          price_per_carat,
          user_id,
          picture,
          certificate_url,
          status
        `)
        .in('stock_number', diamondIds)
        .is('deleted_at', null)

      if (diamondError) {
        console.warn('⚠️ Diamond details query error:', diamondError)
      } else {
        diamondDetails = diamonds || []
      }
    }

    // Enrich match notifications with diamond details
    const enrichedResults = (matchNotifications || []).map(match => {
      const diamond = diamondDetails.find(d => d.stock_number === match.diamond_id)
      return {
        ...match,
        diamond_details: diamond || null,
        match_type: match.is_match ? 'match' : 'unmatch',
        user_role: match.buyer_id.toString() === userId ? 'buyer' : 'seller'
      }
    })

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('match_notifications')
      .select('*', { count: 'exact', head: true })
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .eq('is_match', resultType === 'match' ? true : resultType === 'unmatch' ? false : undefined)

    const response = {
      results: enrichedResults,
      pagination: {
        limit,
        offset,
        total: totalCount || 0,
        has_more: (offset + limit) < (totalCount || 0)
      },
      metadata: {
        user_id: userId,
        result_type: resultType,
        timestamp: new Date().toISOString()
      }
    }

    console.log('✅ Search results fetched successfully:', {
      count: enrichedResults.length,
      total: totalCount,
      userId
    })

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Get Search Results function error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})