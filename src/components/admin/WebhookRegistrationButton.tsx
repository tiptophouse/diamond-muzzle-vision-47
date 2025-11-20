import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export function WebhookRegistrationButton() {
  const [isRegistering, setIsRegistering] = useState(false);
  const { hapticFeedback } = useTelegramWebApp();

  const handleRegisterWebhook = async () => {
    setIsRegistering(true);
    hapticFeedback?.impact('medium');

    try {
      console.log('🔗 Registering Telegram webhook...');

      const { data, error } = await supabase.functions.invoke('register-telegram-webhook');

      if (error) throw error;

      console.log('✅ Webhook registration result:', data);
      hapticFeedback?.notification('success');
      toast.success('✅ Webhook רשום בהצלחה!');
    } catch (error) {
      console.error('❌ Webhook registration error:', error);
      hapticFeedback?.notification('error');
      toast.error('שגיאה ברישום Webhook');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Button
      onClick={handleRegisterWebhook}
      disabled={isRegistering}
      variant="outline"
      size="sm"
    >
      <Settings className="w-4 h-4 mr-2" />
      {isRegistering ? 'רושם...' : 'רשום Telegram Webhook'}
    </Button>
  );
}
