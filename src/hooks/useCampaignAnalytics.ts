
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CampaignLog {
  id: string;
  campaign_type: string;
  campaign_name: string;
  message_content: string;
  target_group: string;
  sent_count: number;
  current_uploaders: number;
  created_at: string;
}

export interface CampaignInteraction {
  id: string;
  campaign_id: string;
  user_id: number;
  interaction_type: 'click' | 'view' | 'share' | 'dismiss';
  created_at: string;
}

export interface CampaignMetrics {
  totalCampaigns: number;
  totalSent: number;
  totalInteractions: number;
  averageEngagement: number;
  recentCampaigns: CampaignLog[];
}

export function useCampaignAnalytics() {
  const [metrics, setMetrics] = useState<CampaignMetrics>({
    totalCampaigns: 0,
    totalSent: 0,
    totalInteractions: 0,
    averageEngagement: 0,
    recentCampaigns: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchCampaignMetrics = async () => {
    setIsLoading(true);
    try {
      // Use analytics_events table to store campaign logs with proper structure
      const { data: campaignLogs, error: logsError } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'campaign_sent')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logsError) throw logsError;

      // Transform analytics events to campaign logs format
      const transformedLogs: CampaignLog[] = (campaignLogs || []).map(log => ({
        id: log.id,
        campaign_type: (log.event_data as any)?.campaign_type || 'unknown',
        campaign_name: (log.event_data as any)?.campaign_name || 'Unnamed Campaign',
        message_content: (log.event_data as any)?.message_content || '',
        target_group: (log.event_data as any)?.target_group || 'all',
        sent_count: (log.event_data as any)?.sent_count || 0,
        current_uploaders: (log.event_data as any)?.current_uploaders || 0,
        created_at: log.created_at
      }));

      // Get campaign interactions from analytics_events
      const { data: interactions, error: interactionsError } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'campaign_interaction');

      if (interactionsError) throw interactionsError;

      const totalSent = transformedLogs.reduce((sum, log) => sum + log.sent_count, 0);
      const totalInteractions = interactions?.length || 0;
      const averageEngagement = totalSent > 0 ? (totalInteractions / totalSent) * 100 : 0;

      setMetrics({
        totalCampaigns: transformedLogs.length,
        totalSent,
        totalInteractions,
        averageEngagement,
        recentCampaigns: transformedLogs
      });
    } catch (error) {
      console.error('Error fetching campaign metrics:', error);
      toast.error('Failed to load campaign analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const logCampaignSent = async (campaignData: Omit<CampaignLog, 'id' | 'created_at'>) => {
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'campaign_sent',
        event_data: campaignData,
        page_path: '/admin',
        session_id: crypto.randomUUID(),
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging campaign:', error);
    }
  };

  const logCampaignInteraction = async (campaignId: string, userId: number, interactionType: string) => {
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'campaign_interaction',
        event_data: {
          campaign_id: campaignId,
          user_id: userId,
          interaction_type: interactionType
        },
        page_path: window.location.pathname,
        session_id: crypto.randomUUID(),
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging campaign interaction:', error);
    }
  };

  useEffect(() => {
    fetchCampaignMetrics();
  }, []);

  return {
    metrics,
    isLoading,
    fetchCampaignMetrics,
    logCampaignSent,
    logCampaignInteraction
  };
}
