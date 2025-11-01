import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const BACKEND_URL = Deno.env.get("BACKEND_URL") || "https://api.mazalbot.com";
const FASTAPI_BEARER_TOKEN = Deno.env.get("FASTAPI_BEARER_TOKEN");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AgentRequest {
  message: string;
  user_id: number;
  agent_type: 'cto' | 'ceo' | 'marketing';
  conversation_history?: Array<{ role: string; content: string }>;
  context?: {
    fastapi_url?: string;
    include_logs?: boolean;
    include_analytics?: boolean;
    include_realtime_data?: boolean;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { message, user_id, agent_type, conversation_history = [], context = {} }: AgentRequest = await req.json();

    console.log("🎯 Executive Agent Request:", { agent_type, user_id, message: message.substring(0, 50) });

    // Gather contextual data based on agent type
    let contextData: any = {};

    if (agent_type === 'cto') {
      // CTO: Technical data
      console.log('🔍 CTO Agent: Fetching technical data...');
      
      const [errors, apiUsage, systemHealth] = await Promise.all([
        supabase.from('error_reports').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('bot_usage_analytics').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('user_sessions').select('total_duration').order('session_start', { ascending: false }).limit(100)
      ]);

      console.log(`📊 Fetched ${errors.data?.length || 0} errors, ${apiUsage.data?.length || 0} API logs`);

      contextData = {
        recent_errors: errors.data?.length || 0,
        error_details: errors.data?.slice(0, 10) || [],
        api_calls_today: apiUsage.data?.length || 0,
        avg_response_time: apiUsage.data?.reduce((sum: number, item: any) => sum + (item.response_time_ms || 0), 0) / (apiUsage.data?.length || 1),
        avg_session_duration: systemHealth.data?.reduce((sum: number, item: any) => {
          const duration = item.total_duration;
          if (duration) {
            const [hours, minutes, seconds] = duration.split(':').map(Number);
            return sum + (hours * 3600 + minutes * 60 + seconds);
          }
          return sum;
        }, 0) / (systemHealth.data?.length || 1)
      };
    } else if (agent_type === 'ceo') {
      // CEO: Business metrics
      console.log('🔍 CEO Agent: Fetching business data...');
      
      // Fetch Supabase data
      const [users, analytics] = await Promise.all([
        supabase.from('user_profiles').select('*'),
        supabase.from('user_analytics').select('*')
      ]);

      console.log(`📊 Fetched ${users.data?.length || 0} users, ${analytics.data?.length || 0} analytics records`);

      // Try to fetch FastAPI diamonds with detailed error handling
      let diamonds: any = { error: 'Not fetched' };
      let fastapiError = '';
      
      try {
        console.log(`🔗 Attempting FastAPI call to: ${BACKEND_URL}/api/v1/get_all_stones`);
        const fastapiResponse = await fetch(`${BACKEND_URL}/api/v1/get_all_stones`, {
          headers: { 
            'Authorization': `Bearer ${FASTAPI_BEARER_TOKEN}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        console.log(`📡 FastAPI Response Status: ${fastapiResponse.status}`);
        
        if (fastapiResponse.ok) {
          diamonds = await fastapiResponse.json();
          console.log(`✅ FastAPI Success: Received ${Array.isArray(diamonds) ? diamonds.length : 0} diamonds`);
        } else {
          const errorText = await fastapiResponse.text();
          fastapiError = `FastAPI returned HTTP ${fastapiResponse.status}`;
          console.error(`❌ FastAPI Error: ${fastapiError} - ${errorText.substring(0, 200)}`);
          diamonds = { error: fastapiError };
        }
      } catch (fetchError: any) {
        fastapiError = `Connection failed: ${fetchError.message}`;
        console.error(`❌ FastAPI Connection Error:`, fetchError);
        diamonds = { error: fastapiError };
      }

      const totalRevenue = analytics.data?.reduce((sum: number, a: any) => sum + (a.revenue_per_user || 0), 0) || 0;
      const totalCosts = analytics.data?.reduce((sum: number, a: any) => sum + (a.cost_per_user || 0), 0) || 0;
      const diamondCount = Array.isArray(diamonds) ? diamonds.length : 0;
      const totalInventoryValue = Array.isArray(diamonds) 
        ? diamonds.reduce((sum: number, d: any) => sum + ((d.price_per_carat || 0) * (d.weight || 0)), 0)
        : 0;

      contextData = {
        total_users: users.data?.length || 0,
        active_users: users.data?.filter((u: any) => {
          const lastActive = u.last_active ? new Date(u.last_active) : null;
          return lastActive && (Date.now() - lastActive.getTime()) < (7 * 24 * 60 * 60 * 1000);
        }).length || 0,
        premium_users: users.data?.filter((u: any) => u.is_premium).length || 0,
        total_revenue: totalRevenue,
        total_costs: totalCosts,
        profit: totalRevenue - totalCosts,
        diamond_count: diamondCount,
        inventory_value: totalInventoryValue,
        fastapi_status: Array.isArray(diamonds) ? 'connected' : 'error',
        fastapi_error: fastapiError || undefined
      };
    } else if (agent_type === 'marketing') {
      // Marketing: Engagement metrics
      console.log('🔍 Marketing Agent: Fetching engagement data...');
      
      const [views, shares, behavior, notifications] = await Promise.all([
        supabase.from('diamond_views').select('*').order('view_start', { ascending: false }).limit(100),
        supabase.from('diamond_share_analytics').select('*').order('view_timestamp', { ascending: false }).limit(100),
        supabase.from('user_behavior_analytics').select('*').order('updated_at', { ascending: false }).limit(50),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      console.log(`📊 Fetched ${views.data?.length || 0} views, ${shares.data?.length || 0} shares`);

      const avgViewTime = views.data?.reduce((sum: number, v: any) => sum + (v.total_view_time || 0), 0) / (views.data?.length || 1);
      const uniqueViewers = new Set(views.data?.map((v: any) => v.viewer_telegram_id)).size;

      contextData = {
        total_views: views.data?.length || 0,
        unique_viewers: uniqueViewers,
        avg_view_time: avgViewTime,
        total_shares: shares.data?.length || 0,
        engagement_rate: (uniqueViewers / (shares.data?.length || 1)) * 100,
        notifications_sent: notifications.data?.length || 0,
        notification_read_rate: (notifications.data?.filter((n: any) => n.read_at).length / (notifications.data?.length || 1)) * 100
      };
    }

    console.log("📊 Context data gathered:", Object.keys(contextData));

    // Build system prompt based on agent type
    const systemPrompts = {
      cto: `You are a CTO Technical Advisor AI. Analyze system performance, errors, and technical metrics.
Current System Data:
${JSON.stringify(contextData, null, 2)}

Provide actionable technical recommendations focusing on:
- System performance and optimization
- Error patterns and fixes
- API efficiency improvements
- Database optimization
- Infrastructure scaling needs

Be concise, data-driven, and specific with your recommendations.`,

      ceo: `You are a CEO Business Advisor AI. Analyze business metrics, revenue, and growth opportunities.
Current Business Data:
${JSON.stringify(contextData, null, 2)}

${contextData.fastapi_error ? `\n⚠️ IMPORTANT: The FastAPI backend (which contains 27,000+ diamonds inventory) is currently unavailable: ${contextData.fastapi_error}

This means inventory value calculations are incomplete. Please:
1. Provide insights based on the available user and revenue data from Supabase
2. Recommend checking FastAPI backend connectivity
3. Note that diamond count shows 0 but this is a connection issue, not actual inventory

Despite the FastAPI connection issue, you can still analyze user growth, revenue trends, and provide strategic recommendations.\n` : ''}

Provide strategic business insights focusing on:
- Revenue and profitability analysis
- User growth and retention
- Market opportunities
- Cost optimization
- Strategic recommendations

Be concise, data-driven, and focus on ROI and business impact.`,

      marketing: `You are a Marketing Strategy Advisor AI. Analyze user engagement, campaigns, and growth.
Current Marketing Data:
${JSON.stringify(contextData, null, 2)}

Provide marketing insights focusing on:
- User engagement patterns
- Campaign effectiveness
- Conversion optimization
- Re-engagement strategies
- Growth opportunities

Be concise, data-driven, and provide actionable marketing tactics.`
    };

    // Call Lovable AI Gateway
    console.log("🤖 Calling Lovable AI with model: google/gemini-2.5-flash");
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompts[agent_type] },
          ...conversation_history,
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`❌ AI Gateway Error: ${aiResponse.status} - ${errorText}`);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const responseContent = aiData.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    console.log("✅ Executive Agent response generated");

    return new Response(
      JSON.stringify({
        response: responseContent,
        agent_used: agent_type,
        metrics: contextData,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Executive Agent Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        response: "I encountered an error analyzing the data. The issue has been logged. Based on what I can see, this might be due to backend connectivity. Please ensure the FastAPI backend is accessible and try again."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
