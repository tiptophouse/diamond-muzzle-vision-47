import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SftpAnalytics {
  totalButtonClicks: number;
  totalCredentialsGenerated: number;
  totalCredentialsSent: number;
  conversionRate: number;
  recentActivity: Array<{
    telegram_id: number;
    event_type: string;
    created_at: string;
    metadata: any;
  }>;
}

export function useAcadiaSftpAnalytics() {
  const [analytics, setAnalytics] = useState<SftpAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      // Fetch SFTP analytics data
      const { data: sftpData, error: sftpError } = await supabase
        .from('acadia_sftp_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (sftpError) throw sftpError;

      // Count events by type
      const buttonClicks = sftpData?.filter(d => d.event_type === 'button_click').length || 0;
      const credentialsGenerated = sftpData?.filter(d => d.event_type === 'credentials_generated').length || 0;
      const credentialsSent = sftpData?.filter(d => d.event_type === 'credentials_sent').length || 0;

      // Calculate conversion rate (clicks to credentials generated)
      const conversionRate = buttonClicks > 0 
        ? Math.round((credentialsGenerated / buttonClicks) * 100) 
        : 0;

      // Get recent activity (last 10)
      const recentActivity = sftpData?.slice(0, 10) || [];

      setAnalytics({
        totalButtonClicks: buttonClicks,
        totalCredentialsGenerated: credentialsGenerated,
        totalCredentialsSent: credentialsSent,
        conversionRate,
        recentActivity: recentActivity.map(item => ({
          telegram_id: item.telegram_id,
          event_type: item.event_type,
          created_at: item.created_at,
          metadata: item.metadata
        }))
      });
    } catch (error) {
      console.error('Error fetching SFTP analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    isLoading,
    refetch: fetchAnalytics
  };
}