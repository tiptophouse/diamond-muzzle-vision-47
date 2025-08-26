
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from '@/hooks/use-toast';

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
    if (!user) return;

    try {
      const { data: analytics, error } = await supabase
        .from('group_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('analysis_date', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
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
