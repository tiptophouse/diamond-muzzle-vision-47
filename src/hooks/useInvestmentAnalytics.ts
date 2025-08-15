
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from '@/components/ui/use-toast';

interface InvestmentAnalytics {
  totalViews: number;
  uniqueViewers: number;
  ndaSignatures: number;
  meetingsScheduled: number;
  conversionRate: number;
  viewsByHour: Record<string, number>;
  topReferrers: Array<{ referrer: string; count: number }>;
  userJourney: Array<{
    step: string;
    users: number;
    dropoff: number;
  }>;
}

interface InvestmentInteraction {
  userId?: number;
  telegramId?: number;
  step: 'view' | 'interest' | 'nda_start' | 'nda_signed' | 'meeting_scheduled';
  metadata?: any;
}

export function useInvestmentAnalytics() {
  const { user } = useTelegramAuth();
  const [analytics, setAnalytics] = useState<InvestmentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Track investment page interaction
  const trackInvestmentInteraction = async (interaction: InvestmentInteraction) => {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: 'investment_interaction',
          page_path: '/investment',
          session_id: crypto.randomUUID(),
          user_agent: navigator.userAgent,
          event_data: {
            step: interaction.step,
            telegram_id: interaction.telegramId || user?.id,
            metadata: interaction.metadata,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            referrer: document.referrer
          }
        });

      if (error) throw error;
      console.log('📊 Investment interaction tracked:', interaction.step);
    } catch (error) {
      console.error('❌ Error tracking investment interaction:', error);
    }
  };

  // Track page view with detailed info
  const trackInvestmentPageView = async () => {
    await trackInvestmentInteraction({
      telegramId: user?.id,
      step: 'view',
      metadata: {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });
  };

  // Track interest expression
  const trackInterestExpressed = async () => {
    await trackInvestmentInteraction({
      telegramId: user?.id,
      step: 'interest',
      metadata: {
        conversion_time: Date.now(),
        page_time: performance.now()
      }
    });
  };

  // Track NDA process
  const trackNDAStart = async () => {
    await trackInvestmentInteraction({
      telegramId: user?.id,
      step: 'nda_start'
    });
  };

  const trackNDASigned = async () => {
    await trackInvestmentInteraction({
      telegramId: user?.id,
      step: 'nda_signed',
      metadata: {
        signed_at: new Date().toISOString()
      }
    });
  };

  // Track meeting scheduling
  const trackMeetingScheduled = async (meetingDetails?: any) => {
    await trackInvestmentInteraction({
      telegramId: user?.id,
      step: 'meeting_scheduled',
      metadata: {
        meeting_details: meetingDetails,
        scheduled_at: new Date().toISOString()
      }
    });
  };

  // Fetch comprehensive analytics
  const fetchInvestmentAnalytics = async (daysBack = 7) => {
    setIsLoading(true);
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysBack);

      const { data: interactions, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'investment_interaction')
        .gte('timestamp', fromDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (!interactions || interactions.length === 0) {
        setAnalytics({
          totalViews: 0,
          uniqueViewers: 0,
          ndaSignatures: 0,
          meetingsScheduled: 0,
          conversionRate: 0,
          viewsByHour: {},
          topReferrers: [],
          userJourney: []
        });
        return;
      }

      // Process analytics data
      const views = interactions.filter(i => i.event_data?.step === 'view');
      const interests = interactions.filter(i => i.event_data?.step === 'interest');
      const ndaStarts = interactions.filter(i => i.event_data?.step === 'nda_start');
      const ndaSigned = interactions.filter(i => i.event_data?.step === 'nda_signed');
      const meetings = interactions.filter(i => i.event_data?.step === 'meeting_scheduled');

      const uniqueViewers = new Set(views.map(v => v.event_data?.telegram_id)).size;
      const conversionRate = uniqueViewers > 0 ? (meetings.length / uniqueViewers) * 100 : 0;

      // Views by hour
      const viewsByHour = views.reduce((acc: Record<string, number>, view) => {
        const hour = new Date(view.timestamp).getHours();
        const hourKey = `${hour}:00`;
        acc[hourKey] = (acc[hourKey] || 0) + 1;
        return acc;
      }, {});

      // Top referrers
      const referrerCounts = views.reduce((acc: Record<string, number>, view) => {
        const referrer = view.event_data?.referrer || 'direct';
        acc[referrer] = (acc[referrer] || 0) + 1;
        return acc;
      }, {});

      const topReferrers = Object.entries(referrerCounts)
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // User journey funnel
      const totalViews = views.length;
      const userJourney = [
        { step: 'Page Views', users: totalViews, dropoff: 0 },
        { step: 'Interest Expressed', users: interests.length, dropoff: totalViews - interests.length },
        { step: 'NDA Started', users: ndaStarts.length, dropoff: interests.length - ndaStarts.length },
        { step: 'NDA Signed', users: ndaSigned.length, dropoff: ndaStarts.length - ndaSigned.length },
        { step: 'Meeting Scheduled', users: meetings.length, dropoff: ndaSigned.length - meetings.length }
      ];

      setAnalytics({
        totalViews,
        uniqueViewers,
        ndaSignatures: ndaSigned.length,
        meetingsScheduled: meetings.length,
        conversionRate: Math.round(conversionRate * 100) / 100,
        viewsByHour,
        topReferrers,
        userJourney
      });

    } catch (error) {
      console.error('❌ Error fetching investment analytics:', error);
      toast({
        title: "שגיאה בטעינת נתוני ההשקעה",
        description: "לא ניתן לטעון את נתוני הקמפיין",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analytics,
    isLoading,
    trackInvestmentPageView,
    trackInterestExpressed,
    trackNDAStart,
    trackNDASigned,
    trackMeetingScheduled,
    fetchInvestmentAnalytics
  };
}
