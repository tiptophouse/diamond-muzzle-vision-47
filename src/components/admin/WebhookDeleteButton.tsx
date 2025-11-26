import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export function WebhookDeleteButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { hapticFeedback } = useTelegramWebApp();

  const handleDeleteWebhook = async () => {
    setIsDeleting(true);
    hapticFeedback?.impact('medium');

    try {
      console.log('🗑️ Deleting Telegram webhook...');

      const { data, error } = await supabase.functions.invoke('delete-telegram-webhook');

      if (error) throw error;

      console.log('✅ Webhook deletion result:', data);
      hapticFeedback?.notification('success');
      toast.success('✅ Webhook נמחק בהצלחה! כעת ניתן להשתמש ב-polling');
    } catch (error) {
      console.error('❌ Webhook deletion error:', error);
      hapticFeedback?.notification('error');
      toast.error('שגיאה במחיקת Webhook');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      onClick={handleDeleteWebhook}
      disabled={isDeleting}
      variant="destructive"
      size="sm"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      {isDeleting ? 'מוחק...' : 'מחק Telegram Webhook'}
    </Button>
  );
}
