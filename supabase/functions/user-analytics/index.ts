
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-action, x-user_id, x-session_id',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const action = req.headers.get('x-action') || 'get_stats';
    const userId = req.headers.get('x-user_id');
    const sessionId = req.headers.get('x-session_id');

    console.log('📊 USER ANALYTICS - Action:', action, 'User:', userId);

    switch (action) {
      case 'start_session': {
        const { telegram_id, user_agent } = await req.json();
        
        console.log('🚀 Starting session for user:', telegram_id);
        
        const { data: session, error } = await supabase
          .from('user_sessions')
          .insert({
            telegram_id: parseInt(telegram_id),
            user_agent,
            is_active: true,
            pages_visited: 0
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Session start error:', error);
          throw new Error(`Failed to start session: ${error.message}`);
        }

        console.log('✅ Session started:', session.id);
        
        return new Response(JSON.stringify({
          success: true,
          data: session,
          message: 'Session started successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'end_session': {
        const { session_id } = await req.json();
        
        console.log('🛑 Ending session:', session_id);
        
        const { data: session, error } = await supabase
          .from('user_sessions')
          .update({
            session_end: new Date().toISOString(),
            is_active: false,
            total_duration: `${Date.now()} milliseconds`
          })
          .eq('id', session_id)
          .select()
          .single();

        if (error) {
          console.error('❌ Session end error:', error);
          throw new Error(`Failed to end session: ${error.message}`);
        }

        console.log('✅ Session ended:', session_id);
        
        return new Response(JSON.stringify({
          success: true,
          data: session,
          message: 'Session ended successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'track_page_visit': {
        const { session_id, page_path, page_title } = await req.json();
        
        console.log('📄 Tracking page visit:', page_path);
        
        // Insert page visit
        const { error: pageError } = await supabase
          .from('page_visits')
          .insert({
            session_id,
            page_path,
            page_title,
            visit_timestamp: new Date().toISOString()
          });

        if (pageError) {
          console.error('❌ Page visit error:', pageError);
        }

        // Update session page count
        const { error: sessionError } = await supabase
          .from('user_sessions')
          .update({
            pages_visited: supabase.sql`pages_visited + 1`
          })
          .eq('id', session_id);

        if (sessionError) {
          console.error('❌ Session update error:', sessionError);
        }

        console.log('✅ Page visit tracked');
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Page visit tracked successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_user_stats': {
        const telegramId = parseInt(userId || '0');
        
        console.log('📊 Getting user stats for:', telegramId);
        
        const { data: analytics, error } = await supabase
          .from('user_analytics')
          .select('*')
          .eq('telegram_id', telegramId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ User stats error:', error);
          throw new Error(`Failed to get user stats: ${error.message}`);
        }

        const { data: sessions, error: sessionError } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('telegram_id', telegramId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (sessionError) {
          console.error('❌ Sessions error:', sessionError);
        }

        console.log('✅ User stats retrieved');
        
        return new Response(JSON.stringify({
          success: true,
          data: {
            analytics: analytics || null,
            recent_sessions: sessions || [],
            total_sessions: sessions?.length || 0
          },
          message: 'User stats retrieved successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_admin_analytics': {
        console.log('🔐 Getting admin analytics');
        
        // Get all user analytics
        const { data: allAnalytics, error: analyticsError } = await supabase
          .from('user_analytics')
          .select('*')
          .order('total_visits', { ascending: false });

        if (analyticsError) {
          console.error('❌ Admin analytics error:', analyticsError);
          throw new Error(`Failed to get admin analytics: ${analyticsError.message}`);
        }

        // Get user profiles for name mapping
        const { data: profiles, error: profileError } = await supabase
          .from('user_profiles')
          .select('telegram_id, first_name, last_name, username, created_at, last_login');

        if (profileError) {
          console.error('❌ Profiles error:', profileError);
        }

        // Get active sessions
        const { data: activeSessions, error: sessionError } = await supabase
          .from('user_sessions')
          .select('telegram_id, session_start, pages_visited')
          .eq('is_active', true);

        if (sessionError) {
          console.error('❌ Active sessions error:', sessionError);
        }

        // Combine data
        const combinedData = allAnalytics?.map(analytics => {
          const profile = profiles?.find(p => p.telegram_id === analytics.telegram_id);
          const activeSession = activeSessions?.find(s => s.telegram_id === analytics.telegram_id);
          
          return {
            ...analytics,
            first_name: profile?.first_name,
            last_name: profile?.last_name,
            username: profile?.username,
            profile_created_at: profile?.created_at,
            last_login: profile?.last_login,
            currently_active: !!activeSession,
            current_session_pages: activeSession?.pages_visited || 0
          };
        });

        console.log('✅ Admin analytics retrieved for', combinedData?.length || 0, 'users');
        
        return new Response(JSON.stringify({
          success: true,
          data: {
            users: combinedData || [],
            total_users: combinedData?.length || 0,
            active_users: activeSessions?.length || 0,
            stats: {
              total_visits: allAnalytics?.reduce((sum, a) => sum + (a.total_visits || 0), 0) || 0,
              total_revenue: allAnalytics?.reduce((sum, a) => sum + (Number(a.revenue_per_user) || 0), 0) || 0,
              total_costs: allAnalytics?.reduce((sum, a) => sum + (Number(a.cost_per_user) || 0), 0) || 0
            }
          },
          message: 'Admin analytics retrieved successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ USER ANALYTICS ERROR:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'User analytics operation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
