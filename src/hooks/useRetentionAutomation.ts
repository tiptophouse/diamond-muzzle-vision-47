import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useRetentionAutomation() {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const triggerRetentionCampaign = async () => {
    setIsRunning(true);
    try {
      console.log('🚀 Triggering retention campaign...');

      const { data, error } = await supabase.functions.invoke('automated-daily-retention', {
        body: {}
      });

      if (error) {
        console.error('❌ Retention campaign error:', error);
        toast({
          title: 'שגיאה',
          description: 'נכשל בהפעלת מערכת ה-retention',
          variant: 'destructive',
        });
        return null;
      }

      console.log('✅ Retention campaign results:', data);

      toast({
        title: '✅ קמפיין הופעל בהצלחה!',
        description: `נשלחו הודעות: ${data.results.newUsers} חדשים, ${data.results.noInventory} תזכורות, ${data.results.dailyReportsPaying + data.results.dailyReportsFree} דוחות יומיים`,
      });

      return data;
    } catch (error) {
      console.error('❌ Failed to trigger retention campaign:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בהפעלת קמפיין ה-retention',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  return {
    triggerRetentionCampaign,
    isRunning,
  };
}
