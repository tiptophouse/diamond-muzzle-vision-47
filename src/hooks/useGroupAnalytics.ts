
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';

interface GroupAnalyticsData {
  total_requests: number;
  market_insights: any[];
  matching_opportunities: any[];
  analysis_timestamp: string;
}

export function useGroupAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<GroupAnalyticsData | null>(null);
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  const analyzeGroupActivity = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please authenticate to analyze group activity.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('📊 Analyzing group activity for user:', user.id);
      
      const { data: result, error } = await supabase.functions.invoke('telegram-group-analyzer', {
        body: { user_id: user.id }
      });

      if (error) {
        throw error;
      }

      if (result?.success) {
        setData(result.data);
        toast({
          title: "Group Analysis Complete",
          description: `Found ${result.data.total_requests} diamond requests and ${result.data.matching_opportunities.length} opportunities.`,
        });
      } else {
        throw new Error(result?.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('❌ Error analyzing group activity:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze group activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStoredAnalytics = async () => {
    if (!user) return [];

    try {
      // Use a simpler query that doesn't rely on the group_analytics table
      // which might not exist in the current schema
      const { data: analytics, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'group_analysis')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('Failed to fetch stored analytics:', error);
        return [];
      }

      return analytics || [];
    } catch (error) {
      console.error('❌ Error fetching stored analytics:', error);
      return [];
    }
  };

  return {
    analyzeGroupActivity,
    getStoredAnalytics,
    isLoading,
    data
  };
}
