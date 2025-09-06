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
    const dateRange = url.searchParams.get('date_range')
    const summary = url.pathname.includes('/summary')

    console.log('🔍 Match Notifications - params:', { userId, dateRange, summary })

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

    if (summary) {
      // Return aggregated summary statistics
      let dateFilter = ''
      let startDate = new Date()
      startDate.setDate(startDate.getDate() - 30) // Default to 30 days

      if (dateRange) {
        const [start, end] = dateRange.split(',')
        if (start) startDate = new Date(start)
      }

      // Get match counts grouped by date
      const { data: dailyStats, error: statsError } = await supabase
        .from('match_notifications')
        .select('created_at, is_match, details_json')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (statsError) {
        console.error('❌ Daily stats query error:', statsError)
        return new Response(JSON.stringify({ error: 'Failed to fetch statistics' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Process statistics by date
      const dailyGroups: { [key: string]: { matches: number; unmatches: number; details: any[] } } = {}
      
      (dailyStats || []).forEach(stat => {
        const dateKey = new Date(stat.created_at).toISOString().split('T')[0] // YYYY-MM-DD
        if (!dailyGroups[dateKey]) {
          dailyGroups[dateKey] = { matches: 0, unmatches: 0, details: [] }
        }
        
        if (stat.is_match) {
          dailyGroups[dateKey].matches++
        } else {
          dailyGroups[dateKey].unmatches++
        }
        
        dailyGroups[dateKey].details.push(stat.details_json)
      })

      const totalMatches = (dailyStats || []).filter(s => s.is_match).length
      const totalUnmatches = (dailyStats || []).filter(s => !s.is_match).length

      const response = {
        summary: {
          total_matches: totalMatches,
          total_unmatches: totalUnmatches,
          date_range: {
            start: startDate.toISOString(),
            end: new Date().toISOString()
          },
          daily_breakdown: Object.entries(dailyGroups).map(([date, stats]) => ({
            date,
            matches: stats.matches,
            unmatches: stats.unmatches,
            total: stats.matches + stats.unmatches
          })).sort((a, b) => b.date.localeCompare(a.date))
        },
        metadata: {
          user_id: userId,
          generated_at: new Date().toISOString()
        }
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } else {
      // Return raw match notifications
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

      if (dateRange) {
        const [start, end] = dateRange.split(',')
        if (start) query = query.gte('created_at', start)
        if (end) query = query.lte('created_at', end)
      }

      const { data: notifications, error: notifError } = await query

      if (notifError) {
        console.error('❌ Notifications query error:', notifError)
        return new Response(JSON.stringify({ error: 'Failed to fetch notifications' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const response = {
        notifications: notifications || [],
        metadata: {
          user_id: userId,
          count: (notifications || []).length,
          date_range: dateRange || null,
          generated_at: new Date().toISOString()
        }
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    console.error('❌ Match Notifications function error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})