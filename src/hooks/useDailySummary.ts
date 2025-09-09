import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface DailySummaryStats {
  totalNotifications: number;
  diamondMatches: number;
  uniqueDiamonds: number;
}

export function useDailySummary() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendDailySummary = async (telegramId: number, forceRun = false): Promise<DailySummaryStats | null> => {
    setIsLoading(true);
    
    try {
      console.log('📊 Sending daily summary for user:', telegramId);
      
      const { data, error } = await supabase.functions.invoke('send-daily-summary', {
        body: {
          telegramId,
          forceRun
        }
      });

      if (error) {
        console.error('❌ Error sending daily summary:', error);
        toast({
          title: "שגיאה בשליחת סיכום יומי",
          description: error.message || "נכשל בשליחת הסיכום היומי",
          variant: "destructive"
        });
        return null;
      }

      if (data?.success) {
        console.log('✅ Daily summary sent successfully:', data);
        toast({
          title: "סיכום יומי נשלח! 📊",
          description: `הסיכום נשלח בהצלחה עם ${data.summaryData?.totalNotifications || 0} התראות`
        });
        
        return data.summaryData;
      } else if (!data?.sent) {
        console.log('ℹ️ No summary needed:', data?.message);
        toast({
          title: "אין סיכום לשליחה",
          description: data?.message || "אין התראות חדשות להיום"
        });
        return null;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to send daily summary:', error);
      toast({
        title: "שגיאה",
        description: "נכשל בשליחת הסיכום היומי",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleDailySummary = async (telegramId: number, timeHour = 18): Promise<void> => {
    try {
      console.log('⏰ Scheduling daily summary for user:', telegramId, 'at hour:', timeHour);
      
      // Create or update user preference for daily summary time
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          telegram_id: telegramId,
          daily_summary_enabled: true,
          daily_summary_time: timeHour,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'telegram_id'
        });

      if (error) {
        console.error('❌ Error scheduling daily summary:', error);
        toast({
          title: "שגיאה בתזמון סיכום",
          description: "נכשל בתזמון הסיכום היומי",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "סיכום יומי הוגדר! ⏰",
        description: `הסיכום יישלח יומית בשעה ${timeHour}:00`
      });
    } catch (error) {
      console.error('❌ Failed to schedule daily summary:', error);
      toast({
        title: "שגיאה",
        description: "נכשל בתזמון הסיכום היומי",
        variant: "destructive"
      });
    }
  };

  const getDailySummaryStats = async (telegramId: number, date?: string): Promise<DailySummaryStats | null> => {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const { data: summary, error } = await supabase
        .from('daily_summaries')
        .select('notifications_count, diamond_matches, unique_diamonds')
        .eq('telegram_id', telegramId)
        .eq('summary_date', targetDate)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching daily summary stats:', error);
        return null;
      }

      if (!summary) {
        // If no summary exists, calculate from notifications
        const { data: notifications, error: notifError } = await supabase
          .from('notifications')
          .select('message_type, metadata')
          .eq('telegram_id', telegramId)
          .gte('created_at', `${targetDate}T00:00:00.000Z`)
          .lt('created_at', `${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T00:00:00.000Z`);

        if (notifError || !notifications) {
          return { totalNotifications: 0, diamondMatches: 0, uniqueDiamonds: 0 };
        }

        const diamondMatches = notifications.filter(n => n.message_type === 'diamond_match').length;
        const uniqueDiamonds = new Set(
          notifications
            .flatMap(n => n.metadata?.matches || [])
            .map((d: any) => d.stock_number)
            .filter(Boolean)
        ).size;

        return {
          totalNotifications: notifications.length,
          diamondMatches,
          uniqueDiamonds
        };
      }

      return {
        totalNotifications: summary.notifications_count,
        diamondMatches: summary.diamond_matches,
        uniqueDiamonds: summary.unique_diamonds
      };
    } catch (error) {
      console.error('❌ Failed to get daily summary stats:', error);
      return null;
    }
  };

  return {
    sendDailySummary,
    scheduleDailySummary,
    getDailySummaryStats,
    isLoading
  };
}