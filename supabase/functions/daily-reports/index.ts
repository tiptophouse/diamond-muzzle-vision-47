import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DailyReportData {
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  totalDiamonds: number;
  newDiamonds: number;
  topPerformers: Array<{
    user_id: number;
    username?: string;
    diamond_count: number;
    total_value: number;
  }>;
  marketTrends: {
    mostPopularShape: string;
    averagePrice: number;
    priceChange: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate daily report
    const reportData = await generateDailyReport(supabase);
    
    // Send to admin via Telegram
    await sendReportToAdmin(reportData);
    
    // Store report in database
    await storeReport(supabase, reportData);

    console.log('✅ Daily report generated and sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily report sent successfully',
        data: reportData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error generating daily report:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function generateDailyReport(supabase: any): Promise<DailyReportData> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Get user statistics
  const { data: userStats } = await supabase.rpc('get_user_statistics');
  
  // Get new signups from yesterday
  const { data: newSignups } = await supabase
    .from('user_profiles')
    .select('id')
    .gte('created_at', `${yesterdayStr}T00:00:00Z`)
    .lt('created_at', `${yesterdayStr}T23:59:59Z`);

  // Get diamond statistics
  const { data: totalDiamonds } = await supabase
    .from('inventory')
    .select('id', { count: 'exact' })
    .is('deleted_at', null);

  // Get new diamonds from yesterday
  const { data: newDiamonds } = await supabase
    .from('inventory')
    .select('id')
    .gte('created_at', `${yesterdayStr}T00:00:00Z`)
    .lt('created_at', `${yesterdayStr}T23:59:59Z`)
    .is('deleted_at', null);

  // Get top performers
  const { data: topPerformers } = await supabase
    .from('inventory')
    .select(`
      user_id,
      weight,
      price_per_carat,
      user_profiles!inner(first_name, username)
    `)
    .is('deleted_at', null)
    .order('price_per_carat', { ascending: false })
    .limit(5);

  // Aggregate top performers data
  const aggregatedPerformers = topPerformers?.reduce((acc: any[], diamond: any) => {
    const existing = acc.find(p => p.user_id === diamond.user_id);
    const totalValue = (diamond.weight || 0) * (diamond.price_per_carat || 0);
    
    if (existing) {
      existing.diamond_count++;
      existing.total_value += totalValue;
    } else {
      acc.push({
        user_id: diamond.user_id,
        username: diamond.user_profiles?.first_name || diamond.user_profiles?.username,
        diamond_count: 1,
        total_value: totalValue
      });
    }
    return acc;
  }, []) || [];

  // Get market trends
  const { data: shapeTrends } = await supabase
    .from('inventory')
    .select('shape')
    .is('deleted_at', null);

  const shapeCount = shapeTrends?.reduce((acc: any, item: any) => {
    acc[item.shape] = (acc[item.shape] || 0) + 1;
    return acc;
  }, {}) || {};

  const mostPopularShape = Object.entries(shapeCount).sort(([,a]: any, [,b]: any) => b - a)[0]?.[0] || 'Round';

  // Calculate average price
  const { data: priceData } = await supabase
    .from('inventory')
    .select('price_per_carat, weight')
    .is('deleted_at', null)
    .not('price_per_carat', 'is', null)
    .not('weight', 'is', null);

  const averagePrice = priceData?.reduce((sum: number, item: any) => {
    return sum + ((item.price_per_carat || 0) * (item.weight || 0));
  }, 0) / (priceData?.length || 1) || 0;

  return {
    totalUsers: userStats?.total_users || 0,
    activeUsers: userStats?.active_users || 0,
    newSignups: newSignups?.length || 0,
    totalDiamonds: totalDiamonds?.length || 0,
    newDiamonds: newDiamonds?.length || 0,
    topPerformers: aggregatedPerformers.slice(0, 3),
    marketTrends: {
      mostPopularShape,
      averagePrice: Math.round(averagePrice),
      priceChange: 0 // Could be calculated with historical data
    }
  };
}

async function sendReportToAdmin(reportData: DailyReportData) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const adminId = Deno.env.get('ADMIN_TELEGRAM_ID') || '2138564172';

  if (!botToken) {
    console.warn('⚠️ No Telegram bot token configured');
    return;
  }

  const reportMessage = `
📊 *Daily Diamond Market Report*
📅 ${new Date().toLocaleDateString()}

👥 *User Statistics:*
• Total Users: ${reportData.totalUsers.toLocaleString()}
• Active Users (7d): ${reportData.activeUsers.toLocaleString()}
• New Signups: ${reportData.newSignups.toLocaleString()}

💎 *Diamond Statistics:*
• Total Diamonds: ${reportData.totalDiamonds.toLocaleString()}
• New Diamonds: ${reportData.newDiamonds.toLocaleString()}

🏆 *Top Performers:*
${reportData.topPerformers.map((user, i) => 
  `${i + 1}. ${user.username || `User ${user.user_id}`}: ${user.diamond_count} diamonds ($${user.total_value.toLocaleString()})`
).join('\n')}

📈 *Market Trends:*
• Most Popular Shape: ${reportData.marketTrends.mostPopularShape}
• Average Price: $${reportData.marketTrends.averagePrice.toLocaleString()}

Generated automatically by Diamond Market Intelligence 🤖
  `;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminId,
        text: reportMessage,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }

    console.log('📤 Daily report sent to admin successfully');
  } catch (error) {
    console.error('❌ Failed to send report to admin:', error);
  }
}

async function storeReport(supabase: any, reportData: DailyReportData) {
  try {
    const { error } = await supabase
      .from('daily_reports')
      .insert([{
        report_date: new Date().toISOString().split('T')[0],
        total_users: reportData.totalUsers,
        active_users: reportData.activeUsers,
        new_signups: reportData.newSignups,
        total_diamonds: reportData.totalDiamonds,
        new_diamonds: reportData.newDiamonds,
        top_performers: reportData.topPerformers,
        market_trends: reportData.marketTrends,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('❌ Failed to store report:', error);
    } else {
      console.log('💾 Report stored in database successfully');
    }
  } catch (error) {
    console.error('❌ Error storing report:', error);
  }
}