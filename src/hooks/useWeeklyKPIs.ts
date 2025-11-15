import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek } from 'date-fns';

export interface WeeklyKPIs {
  // Inventory Metrics
  diamondsAdded: number;
  totalInventoryValue: number;
  avgDiamondPrice: number;
  
  // User Metrics
  newUsers: number;
  activeUsers: number;
  totalUsers: number;
  
  // Engagement Metrics
  totalShares: number;
  totalViews: number;
  totalOffers: number;
  
  // Bot Metrics
  botMessages: number;
  botCommands: number;
  
  // Campaign Metrics
  campaignsSent: number;
  campaignClicks: number;
  
  // Revenue Metrics
  totalOffersValue: number;
  avgOfferValue: number;
  
  // Analytics
  pageVisits: number;
  sessionCount: number;
}

export function useWeeklyKPIs() {
  const [kpis, setKpis] = useState<WeeklyKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyKPIs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 0 }).toISOString();
      const weekEnd = endOfWeek(now, { weekStartsOn: 0 }).toISOString();

      // Fetch all metrics in parallel
      const [
        inventoryResult,
        newUsersResult,
        activeUsersResult,
        totalUsersResult,
        sharesResult,
        viewsResult,
        offersResult,
        botMessagesResult,
        campaignsResult,
        campaignClicksResult,
        pageVisitsResult,
        sessionsResult,
      ] = await Promise.all([
        // Diamonds added this week
        supabase
          .from('inventory')
          .select('price_per_carat, weight')
          .gte('created_at', weekStart)
          .lte('created_at', weekEnd)
          .is('deleted_at', null),
        
        // New users this week
        supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', weekStart)
          .lte('created_at', weekEnd),
        
        // Active users (with sessions this week)
        supabase
          .from('user_sessions')
          .select('telegram_id', { count: 'exact', head: false })
          .gte('created_at', weekStart)
          .lte('created_at', weekEnd),
        
        // Total users
        supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true }),
        
        // Shares this week
        supabase
          .from('diamond_shares')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', weekStart)
          .lte('created_at', weekEnd),
        
        // Views this week
        supabase
          .from('diamond_views')
          .select('id', { count: 'exact', head: true })
          .gte('view_start', weekStart)
          .lte('view_start', weekEnd),
        
        // Offers this week
        supabase
          .from('diamond_offers')
          .select('offered_price')
          .gte('created_at', weekStart)
          .lte('created_at', weekEnd),
        
        // Bot messages this week
        supabase
          .from('bot_usage_analytics')
          .select('id, command', { count: 'exact', head: false })
          .gte('created_at', weekStart)
          .lte('created_at', weekEnd),
        
        // Campaigns sent this week
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .gte('sent_at', weekStart)
          .lte('sent_at', weekEnd),
        
        // Campaign clicks this week
        supabase
          .from('campaign_button_clicks')
          .select('id', { count: 'exact', head: true })
          .gte('clicked_at', weekStart)
          .lte('clicked_at', weekEnd),
        
        // Page visits this week
        supabase
          .from('page_visits')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', weekStart)
          .lte('created_at', weekEnd),
        
        // Sessions this week
        supabase
          .from('user_sessions')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', weekStart)
          .lte('created_at', weekEnd),
      ]);

      // Process inventory data
      const diamonds = inventoryResult.data || [];
      const diamondsAdded = diamonds.length;
      const totalInventoryValue = diamonds.reduce((sum, d) => {
        const price = (d.price_per_carat || 0) * (d.weight || 0);
        return sum + price;
      }, 0);
      const avgDiamondPrice = diamondsAdded > 0 ? totalInventoryValue / diamondsAdded : 0;

      // Process offers data
      const offers = offersResult.data || [];
      const totalOffersValue = offers.reduce((sum, o) => sum + (o.offered_price || 0), 0);
      const avgOfferValue = offers.length > 0 ? totalOffersValue / offers.length : 0;

      // Process bot data
      const botData = botMessagesResult.data || [];
      const botCommands = botData.filter(m => m.command).length;

      // Get unique active users
      const activeUsersData = activeUsersResult.data || [];
      const uniqueActiveUsers = new Set(activeUsersData.map(s => s.telegram_id)).size;

      setKpis({
        diamondsAdded,
        totalInventoryValue,
        avgDiamondPrice,
        newUsers: newUsersResult.count || 0,
        activeUsers: uniqueActiveUsers,
        totalUsers: totalUsersResult.count || 0,
        totalShares: sharesResult.count || 0,
        totalViews: viewsResult.count || 0,
        totalOffers: offers.length,
        botMessages: botMessagesResult.count || 0,
        botCommands,
        campaignsSent: campaignsResult.count || 0,
        campaignClicks: campaignClicksResult.count || 0,
        totalOffersValue,
        avgOfferValue,
        pageVisits: pageVisitsResult.count || 0,
        sessionCount: sessionsResult.count || 0,
      });
    } catch (err) {
      console.error('Error fetching weekly KPIs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch KPIs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyKPIs();
  }, []);

  return {
    kpis,
    isLoading,
    error,
    refetch: fetchWeeklyKPIs,
  };
}
