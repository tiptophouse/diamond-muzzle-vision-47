import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, CheckCircle2 } from 'lucide-react';
import { useTelegramAdvanced } from '@/hooks/useTelegramAdvanced';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function PhoneAccessButton() {
  const [isRequesting, setIsRequesting] = useState(false);
  const [phoneGranted, setPhoneGranted] = useState(false);
  const { requestPhoneAccess, features } = useTelegramAdvanced();
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const handleRequestPhone = async () => {
    if (!features.hasPhoneAccess) {
      toast({
        title: "Not Available",
        description: "Phone access is not supported in your Telegram version. Please update Telegram.",
        variant: "destructive"
      });
      return;
    }

    setIsRequesting(true);
    impactOccurred('medium');

    try {
      const result = await requestPhoneAccess();
      
      if (result) {
        notificationOccurred('success');
        setPhoneGranted(true);
        
        // Get the phone number from Telegram WebApp
        const webApp = (window as any).Telegram?.WebApp;
        const phoneNumber = webApp?.initDataUnsafe?.user?.phone_number;

        if (phoneNumber && user?.id) {
          // Save to database
          const { error } = await supabase
            .from('user_profiles')
            .update({ phone_number: phoneNumber })
            .eq('telegram_id', user.id);

          if (error) {
            console.error('Failed to save phone:', error);
          }
        }

        toast({
          title: "✅ Phone Access Granted",
          description: "Your verified phone number has been saved securely."
        });
      } else {
        notificationOccurred('error');
        toast({
          title: "Access Denied",
          description: "Phone access was not granted. You can try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Phone access error:', error);
      notificationOccurred('error');
      toast({
        title: "Error",
        description: "Failed to request phone access. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRequesting(false);
    }
  };

  if (phoneGranted || user?.phone_number) {
    return (
      <div className="flex items-center gap-2 p-4 bg-success/10 rounded-lg">
        <CheckCircle2 className="h-5 w-5 text-success" />
        <div>
          <p className="font-medium text-success">Phone Verified</p>
          {user?.phone_number && (
            <p className="text-sm text-muted-foreground">{user.phone_number}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleRequestPhone}
      disabled={isRequesting || !features.hasPhoneAccess}
      className="w-full"
      variant="outline"
    >
      <Phone className="mr-2 h-4 w-4" />
      {isRequesting ? 'Requesting...' : 'Grant Phone Access'}
    </Button>
  );
}
