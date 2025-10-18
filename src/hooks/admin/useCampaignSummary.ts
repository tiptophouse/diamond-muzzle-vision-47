import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CampaignSummary {
  activeCampaigns: number;
  messagesSent: number;
  avgClickRate: number;
  totalReach: number;
  recentCampaigns: Array<{
    id: string;
    name: string;
    sent: number;
  }>;
}

export function useCampaignSummary() {
  const [summary, setSummary] = useState<CampaignSummary>({
    activeCampaigns: 0,
    messagesSent: 0,
    avgClickRate: 0,
    totalReach: 0,
    recentCampaigns: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCampaignSummary();
  }, []);

  const fetchCampaignSummary = async () => {
    try {
      setIsLoading(true);

      // Calculate date for "this week"
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Fetch notifications sent this week
      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('id, message_content, telegram_id, sent_at')
        .gte('sent_at', weekAgo.toISOString());

      if (notifError) throw notifError;

      const messagesSent = notifications?.length || 0;
      const uniqueRecipients = new Set(notifications?.map(n => n.telegram_id) || []).size;

      // Fetch group CTA clicks for click rate calculation
      const { data: ctaClicks, error: ctaError } = await supabase
        .from('group_cta_clicks')
        .select('id')
        .gte('clicked_at', weekAgo.toISOString());

      if (ctaError) throw ctaError;

      const clicks = ctaClicks?.length || 0;
      const clickRate = messagesSent > 0 ? Math.round((clicks / messagesSent) * 100) : 0;

      // Get recent campaigns (group by message content prefix)
      const recentCampaignsMap = new Map<string, number>();
      notifications?.forEach(notif => {
        const campaignName = notif.message_content.substring(0, 30) + '...';
        recentCampaignsMap.set(
          campaignName,
          (recentCampaignsMap.get(campaignName) || 0) + 1
        );
      });

      const recentCampaigns = Array.from(recentCampaignsMap.entries())
        .map(([name, sent]) => ({
          id: name,
          name,
          sent
        }))
        .slice(0, 3);

      setSummary({
        activeCampaigns: recentCampaignsMap.size,
        messagesSent,
        avgClickRate: clickRate,
        totalReach: uniqueRecipients,
        recentCampaigns
      });
    } catch (error) {
      console.error('Error fetching campaign summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    summary,
    isLoading,
    refetch: fetchCampaignSummary
  };
}
