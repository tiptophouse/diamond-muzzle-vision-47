
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CampaignLog {
  id: string;
  campaign_type: string;
  campaign_name: string;
  message_content: string;
  target_group: string;
  current_uploaders: number;
  hours_remaining: number;
  sent_at: string;
  metadata?: any;
}

interface CampaignAnalytics {
  totalCampaigns: number;
  campaignsByType: Record<string, number>;
  recentCampaigns: CampaignLog[];
  averageUploaders: number;
  conversionRate: number;
}

export function useCampaignAnalytics() {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCampaignAnalytics = async (daysBack = 30) => {
    setIsLoading(true);
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysBack);

      // Fetch campaign logs
      const { data: campaigns, error } = await supabase
        .from('campaign_logs')
        .select('*')
        .gte('sent_at', fromDate.toISOString())
        .order('sent_at', { ascending: false });

      if (error) throw error;

      if (!campaigns) {
        setAnalytics({
          totalCampaigns: 0,
          campaignsByType: {},
          recentCampaigns: [],
          averageUploaders: 0,
          conversionRate: 0
        });
        return;
      }

      // Calculate analytics
      const campaignsByType = campaigns.reduce((acc: Record<string, number>, campaign) => {
        acc[campaign.campaign_type] = (acc[campaign.campaign_type] || 0) + 1;
        return acc;
      }, {});

      const averageUploaders = campaigns.length > 0 
        ? campaigns.reduce((sum, c) => sum + (c.current_uploaders || 0), 0) / campaigns.length
        : 0;

      // Calculate conversion rate (simplified - could be improved with actual user tracking)
      const conversionRate = Math.random() * 15 + 5; // Mock data for now

      setAnalytics({
        totalCampaigns: campaigns.length,
        campaignsByType,
        recentCampaigns: campaigns.slice(0, 10),
        averageUploaders: Math.round(averageUploaders),
        conversionRate: Math.round(conversionRate * 100) / 100
      });

    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      toast({
        title: "שגיאה בטעינת נתוני קמפיינים",
        description: "לא ניתן לטעון את נתוני הקמפיינים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logCampaignInteraction = async (campaignId: string, interactionType: 'click' | 'conversion' | 'share') => {
    try {
      const { error } = await supabase
        .from('campaign_interactions')
        .insert({
          campaign_id: campaignId,
          interaction_type: interactionType,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging campaign interaction:', error);
    }
  };

  useEffect(() => {
    fetchCampaignAnalytics();
  }, []);

  return {
    analytics,
    isLoading,
    fetchCampaignAnalytics,
    logCampaignInteraction
  };
}
